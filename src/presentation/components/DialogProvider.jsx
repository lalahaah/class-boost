import React, { createContext, useContext, useState, useCallback } from 'react';
import { Info, HelpCircle } from 'lucide-react';

const DialogContext = createContext();

export function DialogProvider({ children }) {
    const [dialog, setDialog] = useState(null);

    const showDialog = useCallback((options) => {
        return new Promise((resolve) => {
            setDialog({
                ...options,
                onConfirm: () => {
                    resolve(true);
                    setDialog(null);
                },
                onCancel: () => {
                    resolve(false);
                    setDialog(null);
                }
            });
        });
    }, []);

    const showAlert = useCallback((message, title = '안내') => {
        return showDialog({ type: 'alert', message, title });
    }, [showDialog]);

    const showConfirm = useCallback((message, title = '확인') => {
        return showDialog({ type: 'confirm', message, title });
    }, [showDialog]);

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            {dialog && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                {dialog.type === 'confirm' ? (
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                        <HelpCircle className="w-6 h-6 text-orange-600" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                        <Info className="w-6 h-6 text-indigo-600" />
                                    </div>
                                )}
                                <h3 className="text-lg font-bold text-slate-900">{dialog.title}</h3>
                            </div>
                            <p className="text-slate-600 mb-6 text-sm font-medium whitespace-pre-wrap leading-relaxed">
                                {dialog.message}
                            </p>
                            <div className="flex gap-3 justify-end">
                                {dialog.type === 'confirm' && (
                                    <button
                                        onClick={dialog.onCancel}
                                        className="cursor-pointer px-4 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors text-sm"
                                    >
                                        취소
                                    </button>
                                )}
                                <button
                                    onClick={dialog.onConfirm}
                                    className={`cursor-pointer px-4 py-2.5 rounded-xl font-bold text-white transition-all shadow-md text-sm ${dialog.type === 'confirm' ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
                                >
                                    확인
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
}

export function useDialog() {
    return useContext(DialogContext);
}
