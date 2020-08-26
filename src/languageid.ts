const languageId = {
    'typescript': ['ts', 'tsx']
}

const languageIdMap: Map<string, string> = new Map()

for(const [langName, arry] of Object.entries(languageId)) {
    for(const langExt of arry) {
        languageIdMap.set(langExt, langName)
    }
}
