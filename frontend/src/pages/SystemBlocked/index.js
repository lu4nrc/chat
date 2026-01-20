import React from "react";
import { i18n } from "../../translate/i18n";
import logo from "../../assets/logo_main.png";

const SystemBlocked = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
                <img src={logo} alt="Logo" className="mx-auto mb-6 h-12 md:h-20 object-contain" />
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                    Sistema Bloqueado
                </h1>
                <p className="text-gray-700 mb-6 text-lg">
                    Favor entrar em contato com o suporte para regularizar o acesso.
                </p>
                <div className="text-sm text-gray-500">
                    Estamos à disposição para ajudar.
                </div>
            </div>
        </div>
    );
};

export default SystemBlocked;
