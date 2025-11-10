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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankTransferController = void 0;
const common_1 = require("@nestjs/common");
const bank_transfer_service_1 = require("./bank-transfer.service");
const bank_transfer_deposit_dto_1 = require("./dto/bank-transfer-deposit.dto");
const roles_decorator_1 = require("../auth/roles.decorator");
let BankTransferController = class BankTransferController {
    bankTransferService;
    constructor(bankTransferService) {
        this.bankTransferService = bankTransferService;
    }
    async deposit(dto, req) {
        const authUserId = req?.user?.id;
        if (!authUserId) {
            throw new common_1.UnauthorizedException('Missing user context');
        }
        return this.bankTransferService.depositViaBankTransfer(authUserId, dto);
    }
};
exports.BankTransferController = BankTransferController;
__decorate([
    (0, common_1.Post)('bank-transfer'),
    (0, roles_decorator_1.Roles)('API'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bank_transfer_deposit_dto_1.BankTransferDepositDto, Object]),
    __metadata("design:returntype", Promise)
], BankTransferController.prototype, "deposit", null);
exports.BankTransferController = BankTransferController = __decorate([
    (0, common_1.Controller)('deposit'),
    __metadata("design:paramtypes", [bank_transfer_service_1.BankTransferService])
], BankTransferController);
//# sourceMappingURL=bank-transfer.controller.js.map