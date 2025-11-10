import { BadRequestException, Injectable } from '@nestjs/common';
import { InvestmentsService } from '../investments/investments.service';
import { BankTransferDepositDto } from './dto/bank-transfer-deposit.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BankTransferService {
  private readonly ALLOCATION_FACTOR = 1.0;
  private readonly EPS = 1e-9;

  constructor(
    private readonly investmentsService: InvestmentsService,
    private readonly prisma: PrismaService,
  ) {}

  private todayRange() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    return { start, end, now };
  }

  private async approvedTotalsForTeamToday(teamId: string | null, start: Date, end: Date) {
    const where: any = {
      status: 'success',
      created_at: { gte: start, lte: end },
    };
    if (teamId) where.team_id = teamId;
    const agg = await this.prisma.investments.aggregate({
      where,
      _sum: { amount: true },
      _count: { _all: true },
    });
    const total = agg._sum.amount ?? new Prisma.Decimal(0);
    const count = agg._count._all ?? 0;
    return { total, count };
  }

  private async pendingTotalForTeamToday(teamId: string | null, start: Date, end: Date) {
    const where: any = {
      status: 'pending',
      created_at: { gte: start, lte: end },
    };
    if (teamId) where.team_id = teamId;
    const agg = await this.prisma.investments.aggregate({ where, _sum: { amount: true } });
    return agg._sum.amount ?? new Prisma.Decimal(0);
  }

  private async approvedTotalsForAccountsToday(accountIds: string[], start: Date, end: Date) {
    if (!accountIds || accountIds.length === 0) return {} as Record<string, Prisma.Decimal>;
    const rows = await this.prisma.investments.groupBy({
      by: ['bank_account_id'],
      where: {
        status: 'success',
        bank_account_id: { in: accountIds },
        created_at: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });
    const map: Record<string, Prisma.Decimal> = {};
    rows.forEach((r) => {
      if (r.bank_account_id) map[r.bank_account_id] = r._sum.amount ?? new Prisma.Decimal(0);
    });
    return map;
  }

  private async computeActiveSecondsMap(teamIds: string[], start: Date, now: Date) {
    // Placeholder: treat teams with investment_status=true as active since start of day
    const dayElapsedSeconds = Math.max(1, Math.floor((now.getTime() - start.getTime()) / 1000));
    const teams = await this.prisma.teams.findMany({
      where: { id: { in: teamIds } },
      select: { id: true, investment_status: true, name: true },
    });
    const map: Record<string, number> = {};
    for (const t of teams) {
      map[t.id] = t.investment_status ? dayElapsedSeconds : 0;
    }
    return { map, dayElapsedSeconds };
  }

  private async assignInvestment(amount: number | string) {
    const amountDec = new Prisma.Decimal(String(amount));
    if (amountDec.lte(0)) throw new BadRequestException('amount must be greater than 0');

    const { start, end, now } = this.todayRange();

    // Fetch active teams and eligible accounts by amount limits and status
    const teams = await this.prisma.teams.findMany({
      where: { investment_status: true },
      include: {
        bank_accounts: {
          where: {
            status: true,
            OR: [{ min_limit: null }, { min_limit: { lte: amountDec } }],
            AND: [{ max_limit: null }, { max_limit: { gte: amountDec } }],
          },
          include: { banks: true },
        },
      },
    });

    const activeTeams = teams.filter((t) => (t.bank_accounts?.length ?? 0) > 0);
    const teamIds = activeTeams.map((t) => t.id);
    const { map: activeSecsMap, dayElapsedSeconds } = await this.computeActiveSecondsMap(teamIds, start, now);

    const results: Array<{
      teamId: string;
      teamName: string | null;
      allocationFactor: number;
      activeSecondsToday: number;
      ratio: number;
      receivedToday: Prisma.Decimal;
      pendingToday: Prisma.Decimal;
      effectiveAmountToday: number;
      accounts: typeof activeTeams[number]['bank_accounts'];
      score: number;
    }> = [];

    for (const t of activeTeams) {
      const secs = activeSecsMap[t.id] ?? 0;
      const activeRatio = secs / dayElapsedSeconds;
      const teamAllocationFactor = Number((t as any).allocation_factor ?? 1.0);
      const ratioVal = activeRatio * this.ALLOCATION_FACTOR * teamAllocationFactor;

      const approved = await this.approvedTotalsForTeamToday(t.id, start, end);
      const pending = await this.pendingTotalForTeamToday(t.id, start, end);
      const effectiveAmount = Number(approved.total) + 0.6 * Number(pending);
      const ratioSafe = ratioVal > 0 ? ratioVal : this.EPS;
      const score = effectiveAmount / (ratioSafe * teamAllocationFactor);

      results.push({
        teamId: t.id,
        teamName: (t as any).name ?? null,
        allocationFactor: teamAllocationFactor,
        activeSecondsToday: secs,
        ratio: ratioVal,
        receivedToday: approved.total,
        pendingToday: pending,
        effectiveAmountToday: effectiveAmount,
        accounts: t.bank_accounts,
        score,
      });
    }

    if (results.length === 0) return null;
    results.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      return Number(a.receivedToday) - Number(b.receivedToday);
    });
    const chosen = results[0];
    const accounts = chosen.accounts ?? [];
    if (accounts.length === 0) return null;

    const accIds = accounts.map((a) => a.id);
    const accTotals = await this.approvedTotalsForAccountsToday(accIds, start, end);
    const accountsSorted = accounts.sort((a, b) => {
      const ta = accTotals[a.id] ? Number(accTotals[a.id]) : 0;
      const tb = accTotals[b.id] ? Number(accTotals[b.id]) : 0;
      if (ta !== tb) return ta - tb;
      return a.id.localeCompare(b.id);
    });
    const selected = accountsSorted[0];

    return {
      teamId: chosen.teamId,
      teamName: chosen.teamName ?? undefined,
      bankAccountId: selected.id,
      iban: selected.account_number ?? undefined,
      fullname: selected.account_name ?? undefined,
      bank_name: (selected as any).banks?.name ?? undefined,
      score: chosen.score,
    };
  }

  async depositViaBankTransfer(authUserId: string, dto: BankTransferDepositDto) {
    if (!dto?.user?.id) throw new BadRequestException('user.id is required');
    if (dto.user.id !== authUserId) {
      throw new BadRequestException('user.id does not match authenticated user');
    }
    if (!dto.transaction_id) throw new BadRequestException('transaction_id is required');

    const assignment = await this.assignInvestment(dto.amount);
    if (!assignment) {
      throw new BadRequestException('No eligible team/account found for amount');
    }
    return this.investmentsService.createBankTransferInvestment(authUserId, dto, {
      teamId: assignment.teamId,
      bankAccountId: assignment.bankAccountId,
      summary: assignment,
    });
  }
}