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
exports.InvestmentsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let InvestmentsService = class InvestmentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBankTransferInvestment(userId, dto, assignment) {
        const rawAmount = dto.amount;
        const amountStr = typeof rawAmount === 'number' ? rawAmount.toString() : String(rawAmount);
        if (!amountStr || isNaN(Number(amountStr)))
            throw new common_1.BadRequestException('Invalid amount');
        const amount = new client_1.Prisma.Decimal(amountStr);
        const paymentInfo = {
            user: dto.user ?? {},
            transaction_id: dto.transaction_id,
            assignment: assignment?.summary ?? null,
        };
        const record = await this.prisma.investments.create({
            data: {
                amount: amount,
                type: 'bank_transfer',
                provider_transaction_id: dto.transaction_id,
                success_url: dto.success_url,
                fail_url: dto.fail_url,
                created_by: userId,
                team_id: assignment?.teamId,
                bank_account_id: assignment?.bankAccountId,
                payment_info: paymentInfo,
            },
        });
        return record;
    }
};
exports.InvestmentsService = InvestmentsService;
exports.InvestmentsService = InvestmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvestmentsService);
//# sourceMappingURL=investments.service.js.map