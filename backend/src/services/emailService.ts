export const sendApprovalEmail = async (email: string, name: string) => {
    console.log(`[EMAIL MOCK] Sending approval email to ${email} (${name})`);
    console.log(`Subject: ¡Bienvenido a MiAppFitness! Tu cuenta ha sido aprobada.`);
    console.log(`Body: Hola ${name}, tu cuenta ha sido aprobada por el administrador. Ya puedes iniciar sesión y completar tu perfil.`);
    return true;
};
