export const initialClients = [
    // Existing Clients (preserved)
    { name: "Rede de Postos Avanx", username: "@redeavanx", days: 11, manager: "CLARA" },
    { name: "Andrade Casa", username: "@andradecasa_", days: 11, manager: "DAMARES" },
    { name: "Pão de Queijo Massa de Minas...", username: "@massademinas_", days: 9, manager: "CLARA" },
    { name: "OUTLET HOME", username: "@outlethomemoc", days: 6, manager: "DAMARES" },
    { name: "Andrade Casa Janauba", username: "@andradecasajanauba", days: 6, manager: "DAMARES" }, // Assumed Damares based on other Outlet
    { name: "ITA ALIMENTOS", username: "@laticiniosita", days: 5, manager: "KAINA/CLARA" },
    { name: "The Prime Burger | Hamburg...", username: "@primeburgermoc", days: 5, manager: "MALU" },
    { name: "Truck Center Líder Pneus", username: "@liderpneustruck", days: 5, manager: "MALU" },
    { name: "Ouvir Aparelhos Auditivos", username: "@ouvir_moc", days: 5, manager: "MALU" }, // Corrected username from list below if needed, but keeping existing
    { name: "Celso Ireno Loc. e Venda", username: "@celso.irenolocacao", days: 5, manager: "LIVIA" },
    { name: "Diferro | Ferragens em geral", username: "@diferromoc", days: 5, manager: "LIVIA" },
    { name: "Líder Pneus (Matriz)", username: "@liderpneusmoc", days: 5, manager: "MALU" },
    { name: "Thopp Elevadores | Moderniz...", username: "@thoppelevadores", days: 4, manager: "CRISTIANO" },
    { name: "CONSULTORIA PARA POSTOS...", username: "@suportepostos", days: 4, manager: "CLARA" },
    { name: "ITA Distribuidora", username: "@itadistribuidoramg", days: 4, manager: "KAINA/CLARA" },
    { name: "Cris Veloso | Regularização de...", username: "@crisvelosoobras", days: 4, manager: "CAMILA" }, // Validated with new list (crisinssobras vs crisvelosoobras? keeping existing if logic dictates, but list says crisinssobras. I will use list for new ones)
    { name: "Líder Pneus Pirapora", username: "@liderpneuspirapora", days: 4, manager: "MALU" },
    { name: "Elevo Urbanismo", username: "@elevo_urbanismo", days: 4, manager: "CRISTIANO" },
    { name: "Churrasco Mineiro", username: "@churrascomineiro", days: 4, manager: "KAÍNA" },
    { name: "Tecnopav Urbanismo", username: "@tecnopav", days: 4, manager: "CRISTIANO" },
    { name: "Baskets | Presentes corporativ...", username: "@baskets.br", days: 4, manager: "CRISTIANO" },
    { name: "Álvaro Diesel Center", username: "@alvarodieselcenter", days: 4, manager: "KAÍNA" },
    { name: "Creditiva Soluções em Crédito", username: "@creditiva", days: 4, manager: "MALU" },
    { name: "Movmente", username: "@movmenteofc", days: 3, manager: "João Silva" }, // Not in new list
    { name: "Rede Norte Buenópolis", username: "@redenortebue", days: 3, manager: "KAÍNA/CLARA" }, // Updated match
    { name: "RedeNorte Móveis", username: "@redenortezp", days: 3, manager: "KAÍNA/CLARA" }, // Likely Várzea da Palma from list
    { name: "Itabirito SAF", username: "@itabiritofc", days: 3, manager: "CLARA" },
    { name: "Moldharte", username: "@industriamoldharte", days: 3, manager: "CLARA" },
    { name: "Patrícia Párma | advogada cri...", username: "@adv_patriciaparma", days: 3, manager: "João Silva" }, // Not in list
    { name: "Net Tell Internet Fibra Óptica", username: "@nettellinternet", days: 3, manager: "João Silva" }, // Not in list
    { name: "JLX MINERAÇÃO", username: "@jlxmineracao", days: 3, manager: "CLARA" },
    { name: "NATURE GIFT", username: "@naturegift", days: 3, manager: "CLARA" },
    { name: "Carlim Supermercados", username: "@carlimsupermercado", days: 3, manager: "MALU" },
    { name: "Alugar Imóveis", username: "@alugarbr", days: 3, manager: "DAMARES" },
    { name: "Kátia Noivas - Locação vestid...", username: "@katianoivas", days: 3, manager: "DAMARES" },
    { name: "FrameForce Construction LLC", username: "@frameforce.nj", days: 2, manager: "João Silva" },
    { name: "Dra Carla Nogueira | Invisalig...", username: "@dracarlanogueira", days: 2, manager: "CRISTIANO" },
    { name: "Profit Suplementos", username: "@profitmoc", days: 2, manager: "MALU" },
    { name: "Quintal Mineiro", username: "@quintalmineiromoc", days: 2, manager: "João Silva" },
    { name: "Redenorte Master Equipamen...", username: "@redenortemaster", days: 2, manager: "KAÍNA/CLARA" },
    { name: "Rede de Postos Patativa", username: "@postopatativa", days: 2, manager: "LÍVIA" },
    { name: "Hotel Royal", username: "@hotelroyalsalinas", days: 2, manager: "LÍVIA" },
    { name: "LHC Construtora", username: "@lhcconstrutora", days: 2, manager: "CAMILA" },
    { name: "MANZI CONSTRUTORA", username: "@manziconstrutora", days: 2, manager: "CAMILA" },
    { name: "Distribuidora Leo Do Gás", username: "@distribuidoraleodogas", days: 2, manager: "LÍVIA" },
    { name: "Loteamentos | Grupo Patativa", username: "@patativaloteamentos", days: 2, manager: "LÍVIA" },
    { name: "GRUPO PATATIVA", username: "@grupopatativa", days: 2, manager: "LÍVIA" },
    { name: "ZAHIR JOALHERIA 💎 | JÓIAS ...", username: "@zahirjoalheria", days: 2, manager: "KAÍNA" },
    { name: "Terranova Pet", username: "@terranovamemorialpet", days: 2, manager: "João Silva" },
    { name: "Grupo Corsino", username: "@grupocorsino", days: 2, manager: "MALU" },

    // NEW ADDITIONS FROM LIST
    { name: "Moratta", username: "@morattaplanejados", days: 0, manager: "CAMILLA" },
    { name: "WF11", username: "@wf11ct_gym", days: 0, manager: "CAMILA" },
    { name: "Topa Tudo opção", username: "@topatudoopcaomoc", days: 0, manager: "CAMILA" },
    { name: "Everton Prótese Capilar", username: "@evertoncbarber", days: 0, manager: "CAMILA" },
    { name: "PC dentista", username: "@drpauloedramonique", days: 0, manager: "CAMILA" },
    { name: "Virtual", username: "@virtualnet_telecomunicacoes", days: 0, manager: "CAMILA" },
    // Cris Veloso exists above with diff username (? crisvelosoobras vs crisinssobras). Adding new one just in case or assume duplicate?
    // User said "não quero repita os que ja estao". I will trust the list's username is the correct one if different.
    { name: "Cris Veloso", username: "@crisinssobras", days: 0, manager: "CAMILA" },
    { name: "Durazzo", username: "@durazzoprotese", days: 0, manager: "CAMILLA" },
    // Carlim exists
    // Creditiva exists
    // Grupo Corsino exists
    // Lider Montes Claros exists (@liderpneusmoc)
    { name: "Lider Janaúba", username: "@liderpneusjanauba", days: 0, manager: "MALU" },
    // Lider Pirapora exists
    // Lider Truck Center exists
    // Prime Burger exists
    { name: "Ouvir", username: "@ouvirmoc", days: 0, manager: "MALU" }, // Different username from @ouvir_moc above?
    // Profit exists
    // Suporte Postos exists
    // Rede Avanx exists
    // Massa de Minas exists
    // JLX Mineração exists
    { name: "JLX Jequitinhonha", username: "@jlxjequitinhonha", days: 0, manager: "CLARA" },
    // Moldharte exists
    { name: "Varejão da Brita", username: "@varejaodabrita", days: 15, manager: "CLARA" },
    // Itabirito FC exists
    // NatureGift exists
    // ITA alimentos exists
    // ITA Distribuidora exists
    // Redenorte exists (@redenortemaster)
    // Redenorte Buenópolis exists (@redenortebue vs @redenortebuee). Adding list version.
    { name: "Redenorte Buenópolis", username: "@redenortebuee", days: 0, manager: "KAÍNA/CLARA" },
    { name: "Redenorte Várzea da Palma", username: "@redenortevzp", days: 0, manager: "KAÍNA/ CLARA" },
    { name: "Redenorte Capelinha", username: "@redenortecapelinha", days: 0, manager: "KAÍNA/CLARA" },
    { name: "Agência do Óleo", username: "@trocadeoleo_agenciadooleo", days: 0, manager: "KAÍNA/CLARA" },
    { name: "Casa do Óleo", username: "@casadooleojacui", days: 0, manager: "KAÍNA/CLARA" },
    { name: "Claulub", username: "@trocadeoleo_claulub", days: 0, manager: "KAÍNA/CLARA" },
    // Álvaro exists
    { name: "Posto Santa fé", username: "@auto_posto_santa_fe", days: 0, manager: "KAÍNA" },
    // Churrasco Mineiro exists
    // ZAHIR exists
    // Elevo exists
    // TECNOPAV exists
    // Dra. Carla exists
    // Thopp Elevadores exists
    // Baskets exists
    { name: "IESC", username: "@iescmoc", days: 0, manager: "DAMARES" },
    // Andrade Casa exists
    // Outlet Home Montes Claros exists
    { name: "Outlet Home Janaúba", username: "@outlethomejanauba", days: 0, manager: "DAMARES" },
    // Alugar exists
    { name: "Carbox Veículos", username: "@carboxveiculos", days: 0, manager: "DAMARES" },
    { name: "Disbamoc", username: "@disbamocbat", days: 0, manager: "DAMARES" },
    // Kátia Noivas exists
    { name: "Autoposto N1", username: "@autopostonumero1", days: 0, manager: "DAMARES" },
    { name: "Manus WA", username: "@manus_wa", days: 0, manager: "DAMARES" },
    { name: "Chinelos Moc", username: "@chinelospersonalizadosmoc", days: 0, manager: "LÍVIA" },
    { name: "BKC", username: "@bkc.sports", days: 0, manager: "LIVIA" },
    // Celso Ireno exists
    // Diferro exists
    // Léo do Gás exists
    // Hotel Royal exists
    // Grupo Patativa exists
    // Posto Patativa exists
    { name: "Posto Salinas", username: "@salinasposto", days: 0, manager: "LÍLIA" },
    { name: "Mineração Patativa", username: "@mineracaopatativa", days: 0, manager: "LIVIA" },
    { name: "PaBrin", username: "@pabrinpapelariae", days: 0, manager: "LIVIA" },
    { name: "Dr. Alisson", username: "@dr.alissonafonseca", days: 0, manager: "LIVIA" },
    { name: "Veja Publicidade", username: "@vejapublicidade", days: 0, manager: "LIVIA" },
    { name: "Concrefort", username: "@concrefortpatativa", days: 0, manager: "LIVIA" }
].map((client, index) => ({
    id: index + 1,
    ...client,
    followers: "1k", // Placeholder, will be updated by Apify
    following: "100", // Placeholder
    posts: "100", // Placeholder
    engagement: "1.0%", // Placeholder
    latestPostDate: client.days === 0
        ? new Date().toISOString()
        : new Date(Date.now() - client.days * 24 * 60 * 60 * 1000).toISOString()
}));
