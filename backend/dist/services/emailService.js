"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendApprovalEmail = void 0;
const sendApprovalEmail = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`[EMAIL MOCK] Sending approval email to ${email} (${name})`);
    console.log(`Subject: ¡Bienvenido a MiAppFitness! Tu cuenta ha sido aprobada.`);
    console.log(`Body: Hola ${name}, tu cuenta ha sido aprobada por el administrador. Ya puedes iniciar sesión y completar tu perfil.`);
    return true;
});
exports.sendApprovalEmail = sendApprovalEmail;
