"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankTransferService = void 0;
const common_1 = require("@nestjs/common");
const investments_service_1 = require("../investments/investments.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let BankTransferService = class BankTransferService {
    investmentsService;
    prisma;
    ALLOCATION_FACTOR = 1.0;
    EPS = 1e-9;
    constructor(investmentsService, prisma) {
        this.investmentsService = investmentsService;
        this.prisma = prisma;
    }
    todayRange() {
        const now = new Date();
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(now);
        end.setHours(23, 59, 59, 999);
        return { start, end, now };
    }
    async approvedTotalsForTeamToday(teamId, start, end) {
        const where = {
            status: 'success',
            created_at: { gte: start, lte: end },
        };
        if (teamId)
            where.team_id = teamId;
        const agg = await this.prisma.investments.aggregate({
            where,
            _sum: { amount: true },
            _count: { _all: true },
        });
        const total = agg._sum.amount ?? new client_1.Prisma.Decimal(0);
        const count = agg._count._all ?? 0;
        return { total, count };
    }
    async pendingTotalForTeamToday(teamId, start, end) {
        const where = {
            status: 'pending',
            created_at: { gte: start, lte: end },
        };
        if (teamId)
            where.team_id = teamId;
        const agg = await this.prisma.investments.aggregate({ where, _sum: { amount: true } });
        return agg._sum.amount ?? new client_1.Prisma.Decimal(0);
    }
    async approvedTotalsForAccountsToday(accountIds, start, end) {
        if (!accountIds || accountIds.length === 0)
            return {};
        const rows = await this.prisma.investments.groupBy({
            by: ['bank_account_id'],
            where: {
                status: 'success',
                bank_account_id: { in: accountIds },
                created_at: { gte: start, lte: end },
            },
            _sum: { amount: true },
        });
        const map = {};
        rows.forEach((r) => {
            if (r.bank_account_id)
                map[r.bank_account_id] = r._sum.amount ?? new client_1.Prisma.Decimal(0);
        });
        return map;
    }
    async computeActiveSecondsMap(teamIds, start, now) {
        const dayElapsedSeconds = Math.max(1, Math.floor((now.getTime() - start.getTime()) / 1000));
        const teams = await this.prisma.teams.findMany({
            where: { id: { in: teamIds } },
            select: { id: true, investment_status: true, name: true },
        });
        const map = {};
        for (const t of teams) {
            map[t.id] = t.investment_status ? dayElapsedSeconds : 0;
        }
        return { map, dayElapsedSeconds };
    }
    async assignInvestment(amount) {
        const amountDec = new client_1.Prisma.Decimal(String(amount));
        if (amountDec.lte(0))
            throw new common_1.BadRequestException('amount must be greater than 0');
        const { start, end, now } = this.todayRange();
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
        const results = [];
        for (const t of activeTeams) {
            const secs = activeSecsMap[t.id] ?? 0;
            const activeRatio = secs / dayElapsedSeconds;
            const teamAllocationFactor = Number(t.allocation_factor ?? 1.0);
            const ratioVal = activeRatio * this.ALLOCATION_FACTOR * teamAllocationFactor;
            const approved = await this.approvedTotalsForTeamToday(t.id, start, end);
            const pending = await this.pendingTotalForTeamToday(t.id, start, end);
            const effectiveAmount = Number(approved.total) + 0.6 * Number(pending);
            const ratioSafe = ratioVal > 0 ? ratioVal : this.EPS;
            const score = effectiveAmount / (ratioSafe * teamAllocationFactor);
            results.push({
                teamId: t.id,
                teamName: t.name ?? null,
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
        if (results.length === 0)
            return null;
        results.sort((a, b) => {
            if (a.score !== b.score)
                return a.score - b.score;
            return Number(a.receivedToday) - Number(b.receivedToday);
        });
        const chosen = results[0];
        const accounts = chosen.accounts ?? [];
        if (accounts.length === 0)
            return null;
        const accIds = accounts.map((a) => a.id);
        const accTotals = await this.approvedTotalsForAccountsToday(accIds, start, end);
        const accountsSorted = accounts.sort((a, b) => {
            const ta = accTotals[a.id] ? Number(accTotals[a.id]) : 0;
            const tb = accTotals[b.id] ? Number(accTotals[b.id]) : 0;
            if (ta !== tb)
                return ta - tb;
            return a.id.localeCompare(b.id);
        });
        const selected = accountsSorted[0];
        return {
            teamId: chosen.teamId,
            teamName: chosen.teamName ?? undefined,
            bankAccountId: selected.id,
            iban: selected.account_number ?? undefined,
            fullname: selected.account_name ?? undefined,
            bank_name: selected.banks?.name ?? undefined,
            score: chosen.score,
        };
    }
    async depositViaBankTransfer(authUserId, dto) {
        if (!dto?.user?.id)
            throw new common_1.BadRequestException('user.id is required');
        if (dto.user.id !== authUserId) {
            throw new common_1.BadRequestException('user.id does not match authenticated user');
        }
        if (!dto.transaction_id)
            throw new common_1.BadRequestException('transaction_id is required');
        const assignment = await this.assignInvestment(dto.amount);
        if (!assignment) {
            throw new common_1.BadRequestException('No eligible team/account found for amount');
        }
        return this.investmentsService.createBankTransferInvestment(authUserId, dto, {
            teamId: assignment.teamId,
            bankAccountId: assignment.bankAccountId,
            summary: assignment,
        });
    }
};
exports.BankTransferService = BankTransferService;
exports.BankTransferService = BankTransferService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [investments_service_1.InvestmentsService,
        prisma_service_1.PrismaService])
], BankTransferService);
//# sourceMappingURL=bank-transfer.service.js.map