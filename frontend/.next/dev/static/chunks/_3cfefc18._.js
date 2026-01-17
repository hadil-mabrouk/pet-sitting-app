(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/lib/i18n.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "I18nProvider",
    ()=>I18nProvider,
    "useI18n",
    ()=>useI18n
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
;
const translations = {
    login: {
        fr: "Se connecter"
    },
    signup: {
        fr: "S'inscrire"
    },
    logout: {
        fr: "Déconnexion"
    },
    owner: {
        fr: "Propriétaire"
    },
    sitter: {
        fr: "Gardien"
    },
    myPets: {
        fr: "Mes animaux"
    },
    addPet: {
        fr: "Ajouter un animal"
    },
    createRequest: {
        fr: "Créer une demande"
    },
    myRequests: {
        fr: "Mes demandes"
    },
    offers: {
        fr: "Offres"
    },
    bookings: {
        fr: "Réservations"
    },
    completeBooking: {
        fr: "Terminer la réservation"
    },
    review: {
        fr: "Évaluer"
    },
    sendReview: {
        fr: "Envoyer l'avis"
    },
    available: {
        fr: "Disponible"
    },
    unavailable: {
        fr: "Indisponible"
    },
    trust: {
        fr: "Confiance"
    },
    avgRating: {
        fr: "Note moyenne"
    },
    reviewsCount: {
        fr: "Nombre d'avis"
    },
    cancelRequest: {
        fr: "Annuler la demande"
    },
    accept: {
        fr: "Accepter"
    },
    reject: {
        fr: "Refuser"
    },
    nearSitters: {
        fr: "Gardiens proches"
    },
    openRequests: {
        fr: "Demandes ouvertes"
    },
    myBookings: {
        fr: "Mes réservations"
    },
    myOffers: {
        fr: "Mes offres"
    },
    requestDetails: {
        fr: "Détails de la demande"
    },
    createOffer: {
        fr: "Créer une offre"
    },
    price: {
        fr: "Prix"
    },
    message: {
        fr: "Message"
    },
    submit: {
        fr: "Envoyer"
    },
    distanceFilter: {
        fr: "Filtre distance"
    },
    useLocation: {
        fr: "Utiliser ma position"
    },
    status: {
        fr: "Statut"
    },
    pet: {
        fr: "Animal"
    },
    serviceType: {
        fr: "Type de service"
    },
    date: {
        fr: "Date"
    },
    location: {
        fr: "Localisation"
    },
    offeredPrice: {
        fr: "Prix proposé"
    },
    offersReceived: {
        fr: "Offres reçues"
    },
    noData: {
        fr: "Pas de données"
    },
    menu: {
        fr: "Menu"
    },
    profile: {
        fr: "Mon profil"
    },
    settings: {
        fr: "Paramètres"
    },
    activeBooking: {
        fr: "Réservation active"
    },
    filter: {
        fr: "Filtrer"
    }
};
const I18nContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function I18nProvider({ children }) {
    _s();
    const [lang, setLang] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("fr");
    const rtl = false;
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "I18nProvider.useMemo[t]": ()=>({
                "I18nProvider.useMemo[t]": (key)=>translations[key]?.fr ?? key
            })["I18nProvider.useMemo[t]"]
    }["I18nProvider.useMemo[t]"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(I18nContext.Provider, {
        value: {
            lang,
            setLang,
            t,
            rtl
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/lib/i18n.tsx",
        lineNumber: 68,
        columnNumber: 10
    }, this);
}
_s(I18nProvider, "jzbmwaJ1Zac8YOg/PMHxboxUfwU=");
_c = I18nProvider;
function useI18n() {
    _s1();
    const ctx = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(I18nContext);
    if (!ctx) throw new Error("useI18n must be used within I18nProvider");
    return ctx;
}
_s1(useI18n, "/dMy7t63NXD4eYACoT93CePwGrg=");
var _c;
__turbopack_context__.k.register(_c, "I18nProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/providers.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/i18n.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function DirController({ children }) {
    _s();
    const { rtl } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useI18n"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DirController.useEffect": ()=>{
            if (typeof document !== "undefined") {
                document.documentElement.dir = rtl ? "rtl" : "ltr";
            }
        }
    }["DirController.useEffect"], [
        rtl
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(DirController, "CJnpPsAonfaTMstatbnH04S6mIE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useI18n"]
    ];
});
_c = DirController;
function Providers({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$i18n$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["I18nProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DirController, {
            children: children
        }, void 0, false, {
            fileName: "[project]/app/providers.tsx",
            lineNumber: 19,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/providers.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_c1 = Providers;
var _c, _c1;
__turbopack_context__.k.register(_c, "DirController");
__turbopack_context__.k.register(_c1, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_3cfefc18._.js.map