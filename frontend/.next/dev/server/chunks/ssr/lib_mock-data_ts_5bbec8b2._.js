module.exports = [
"[project]/lib/mock-data.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/lib_mock-data_ts_1fded9ed._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/lib/mock-data.ts [app-ssr] (ecmascript)");
    });
});
}),
];