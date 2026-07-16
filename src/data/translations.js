/**
 * @fileoverview Translation maps for 12 languages. Each key maps to a flat/nested object structure.
 * @module data/translations
 */

const translations = {
  en: {
    app: { title: 'FIFA 2026 Smart Stadium', subtitle: 'Command & Fan Portal' },
    nav: {
      fanHome: 'Fan Dashboard', assistant: 'AI Assistant', navigation: 'Smart Navigation',
      eco: 'Eco Tracker', orgHome: 'Command Center', crowd: 'Crowd Intelligence',
      incidents: 'Incidents', switchToFan: 'Fan Mode', switchToOrg: 'Staff Mode'
    },
    fan: {
      welcome: 'Welcome to FIFA World Cup 2026',
      subtitle: 'Your smart companion for the ultimate matchday experience',
      quickActions: 'Quick Actions',
      askAssistant: 'Ask AI Assistant',
      findWay: 'Find My Way',
      trackEco: 'Track My Impact',
      liveMatch: 'Live Match Info',
      nearbyServices: 'Nearby Services',
      matchDay: 'Match Day',
      todayMatch: "Today's Match",
      kickoff: 'Kickoff',
      venue: 'Venue',
      weather: 'Weather'
    },
    chat: {
      title: 'AI Assistant',
      subtitle: 'Ask me anything about the World Cup',
      placeholder: 'Type your question...',
      send: 'Send',
      voice: 'Voice Input',
      thinking: 'Thinking...',
      welcome: 'Hello! I\'m your FIFA 2026 AI assistant. I can help you with match schedules, venue navigation, transit info, accessibility services, and more. How can I assist you today?',
      errorResponse: 'I\'m sorry, I encountered an issue processing your request. Please try again.',
      langDetected: 'Language detected: {{lang}}',
      clearChat: 'Clear Chat'
    },
    navigation: {
      title: 'Smart Navigation Hub',
      subtitle: 'Find the best route with real-time crowd awareness',
      crowdDensity: 'Crowd Density',
      accessibleRoutes: 'Accessible Routes',
      shuttleTimes: 'Shuttle & Transit',
      walkingTime: 'Walking Time',
      distance: 'Distance',
      crowdLevel: 'Crowd Level',
      low: 'Low', medium: 'Medium', high: 'High',
      features: 'Route Features',
      elevator: 'Elevator', ramp: 'Ramp', stairs: 'Stairs',
      accessible: 'Wheelchair Accessible',
      shuttleWait: 'Shuttle Wait Time',
      minutes: '{{count}} min',
      nextShuttle: 'Next shuttle in',
      destination: 'Destination',
      from: 'From',
      to: 'To'
    },
    eco: {
      title: 'Sustainability & Eco-Tracker',
      subtitle: 'Make a green impact at the World Cup',
      yourPoints: 'Your Green Points',
      carbonSaved: 'Carbon Saved',
      treesEquivalent: 'Trees Equivalent',
      leaderboard: 'Fan Leaderboard',
      achievements: 'Achievements',
      actions: 'Earn Points',
      wasteSegregation: 'Waste Segregation',
      digitalTicket: 'Digital Ticket',
      publicTransit: 'Public Transit',
      refillBottle: 'Refillable Bottle',
      carbonNeutral: 'Carbon Neutral Travel',
      pointsEarned: '+{{points}} points',
      rank: 'Rank #{{rank}}',
      kg: '{{value}} kg CO₂',
      trees: '{{count}} trees'
    },
    crowd: {
      title: 'Operational Intelligence',
      subtitle: 'Real-time crowd management and predictive analytics',
      totalCapacity: 'Total Capacity',
      currentOccupancy: 'Current Occupancy',
      gateStatus: 'Gate Status',
      chokePoints: 'Choke Points',
      redistribution: 'AI Redistribution',
      predictions: 'Predictions',
      gate: 'Gate {{name}}',
      throughput: 'Throughput',
      waitTime: 'Wait Time',
      capacity: 'Capacity',
      warning: 'Warning',
      critical: 'Critical',
      normal: 'Normal',
      suggestion: 'AI Suggestion',
      refreshData: 'Refresh Data'
    },
    incidents: {
      title: 'Incident Management',
      subtitle: 'Real-time decision support and response coordination',
      reportNew: 'Report Incident',
      activeIncidents: 'Active Incidents',
      resolved: 'Resolved',
      totalToday: 'Total Today',
      avgResponse: 'Avg Response',
      category: 'Category',
      location: 'Location',
      severity: 'Severity',
      description: 'Description',
      status: 'Status',
      protocol: 'Response Protocol',
      submit: 'Submit Report',
      categories: {
        medical: 'Medical Emergency', security: 'Security Issue', infrastructure: 'Infrastructure',
        crowd: 'Crowd Control', weather: 'Weather Alert', general: 'General'
      },
      severities: { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' },
      statuses: { reported: 'Reported', acknowledged: 'Acknowledged', inProgress: 'In Progress', resolved: 'Resolved' },
      protocolTitle: 'Automated Response Protocol',
      deployPersonnel: 'Deploy Personnel',
      estimatedResponse: 'Estimated Response',
      personnelNeeded: 'Personnel Needed'
    },
    common: {
      loading: 'Loading...', error: 'Error', retry: 'Retry', close: 'Close',
      save: 'Save', cancel: 'Cancel', confirm: 'Confirm', search: 'Search',
      noData: 'No data available', offline: 'You are offline',
      backToTop: 'Back to top', selectVenue: 'Select Venue'
    }
  },

  es: {
    app: { title: 'FIFA 2026 Estadio Inteligente', subtitle: 'Portal de Comando y Aficionado' },
    nav: {
      fanHome: 'Panel del Aficionado', assistant: 'Asistente IA', navigation: 'Navegación Inteligente',
      eco: 'Eco Rastreador', orgHome: 'Centro de Comando', crowd: 'Inteligencia de Multitudes',
      incidents: 'Incidentes', switchToFan: 'Modo Aficionado', switchToOrg: 'Modo Personal'
    },
    fan: {
      welcome: 'Bienvenido a la Copa Mundial FIFA 2026',
      subtitle: 'Tu compañero inteligente para la mejor experiencia del día del partido',
      quickActions: 'Acciones Rápidas', askAssistant: 'Preguntar al Asistente IA',
      findWay: 'Encontrar Mi Camino', trackEco: 'Rastrear Mi Impacto',
      liveMatch: 'Info del Partido en Vivo', nearbyServices: 'Servicios Cercanos',
      matchDay: 'Día del Partido', todayMatch: 'Partido de Hoy',
      kickoff: 'Inicio', venue: 'Sede', weather: 'Clima'
    },
    chat: {
      title: 'Asistente IA', subtitle: 'Pregúntame sobre la Copa del Mundo',
      placeholder: 'Escribe tu pregunta...', send: 'Enviar', voice: 'Entrada de Voz',
      thinking: 'Pensando...', clearChat: 'Limpiar Chat',
      welcome: '¡Hola! Soy tu asistente IA de FIFA 2026. Puedo ayudarte con horarios de partidos, navegación del estadio, transporte y más. ¿Cómo puedo asistirte hoy?',
      errorResponse: 'Lo siento, encontré un problema al procesar tu solicitud. Por favor intenta de nuevo.'
    },
    navigation: {
      title: 'Centro de Navegación Inteligente', subtitle: 'Encuentra la mejor ruta con conciencia de multitudes',
      crowdDensity: 'Densidad de Multitud', accessibleRoutes: 'Rutas Accesibles',
      shuttleTimes: 'Transporte y Tránsito', walkingTime: 'Tiempo Caminando',
      distance: 'Distancia', crowdLevel: 'Nivel de Multitud',
      low: 'Bajo', medium: 'Medio', high: 'Alto',
      features: 'Características de la Ruta', elevator: 'Ascensor', ramp: 'Rampa', stairs: 'Escaleras',
      accessible: 'Accesible en Silla de Ruedas', shuttleWait: 'Tiempo de Espera del Shuttle',
      minutes: '{{count}} min', nextShuttle: 'Próximo shuttle en',
      destination: 'Destino', from: 'Desde', to: 'Hasta'
    },
    eco: {
      title: 'Sostenibilidad y Eco-Rastreador', subtitle: 'Haz un impacto verde en la Copa del Mundo',
      yourPoints: 'Tus Puntos Verdes', carbonSaved: 'Carbono Ahorrado', treesEquivalent: 'Árboles Equivalentes',
      leaderboard: 'Tabla de Clasificación', achievements: 'Logros', actions: 'Ganar Puntos',
      wasteSegregation: 'Separación de Residuos', digitalTicket: 'Boleto Digital',
      publicTransit: 'Transporte Público', refillBottle: 'Botella Reutilizable',
      carbonNeutral: 'Viaje Carbono Neutral', pointsEarned: '+{{points}} puntos',
      rank: 'Rango #{{rank}}', kg: '{{value}} kg CO₂', trees: '{{count}} árboles'
    },
    crowd: {
      title: 'Inteligencia Operacional', subtitle: 'Gestión de multitudes y análisis predictivo en tiempo real',
      totalCapacity: 'Capacidad Total', currentOccupancy: 'Ocupación Actual',
      gateStatus: 'Estado de Puertas', chokePoints: 'Puntos de Congestión',
      redistribution: 'Redistribución IA', predictions: 'Predicciones',
      gate: 'Puerta {{name}}', throughput: 'Flujo', waitTime: 'Tiempo de Espera',
      capacity: 'Capacidad', warning: 'Advertencia', critical: 'Crítico', normal: 'Normal',
      suggestion: 'Sugerencia IA', refreshData: 'Actualizar Datos'
    },
    incidents: {
      title: 'Gestión de Incidentes', subtitle: 'Soporte de decisiones en tiempo real',
      reportNew: 'Reportar Incidente', activeIncidents: 'Incidentes Activos',
      resolved: 'Resueltos', totalToday: 'Total Hoy', avgResponse: 'Respuesta Promedio',
      category: 'Categoría', location: 'Ubicación', severity: 'Severidad',
      description: 'Descripción', status: 'Estado', protocol: 'Protocolo de Respuesta',
      submit: 'Enviar Reporte',
      categories: { medical: 'Emergencia Médica', security: 'Problema de Seguridad', infrastructure: 'Infraestructura', crowd: 'Control de Multitudes', weather: 'Alerta Climática', general: 'General' },
      severities: { critical: 'Crítico', high: 'Alto', medium: 'Medio', low: 'Bajo' },
      statuses: { reported: 'Reportado', acknowledged: 'Reconocido', inProgress: 'En Progreso', resolved: 'Resuelto' },
      protocolTitle: 'Protocolo de Respuesta Automatizado', deployPersonnel: 'Desplegar Personal',
      estimatedResponse: 'Respuesta Estimada', personnelNeeded: 'Personal Necesario'
    },
    common: {
      loading: 'Cargando...', error: 'Error', retry: 'Reintentar', close: 'Cerrar',
      save: 'Guardar', cancel: 'Cancelar', confirm: 'Confirmar', search: 'Buscar',
      noData: 'Sin datos disponibles', offline: 'Estás sin conexión',
      backToTop: 'Volver arriba', selectVenue: 'Seleccionar Sede'
    }
  },

  fr: {
    app: { title: 'FIFA 2026 Stade Intelligent', subtitle: 'Portail de Commandement et Fan' },
    nav: { fanHome: 'Tableau de Bord Fan', assistant: 'Assistant IA', navigation: 'Navigation Intelligente', eco: 'Éco Suivi', orgHome: 'Centre de Commandement', crowd: 'Intelligence de Foule', incidents: 'Incidents', switchToFan: 'Mode Fan', switchToOrg: 'Mode Personnel' },
    fan: { welcome: 'Bienvenue à la Coupe du Monde FIFA 2026', subtitle: 'Votre compagnon intelligent pour le jour du match', quickActions: 'Actions Rapides', askAssistant: 'Demander à l\'IA', findWay: 'Trouver Mon Chemin', trackEco: 'Suivre Mon Impact', liveMatch: 'Info Match en Direct', nearbyServices: 'Services à Proximité', matchDay: 'Jour de Match', todayMatch: 'Match du Jour', kickoff: 'Coup d\'envoi', venue: 'Stade', weather: 'Météo' },
    chat: { title: 'Assistant IA', subtitle: 'Posez-moi vos questions sur la Coupe du Monde', placeholder: 'Tapez votre question...', send: 'Envoyer', voice: 'Saisie Vocale', thinking: 'Réflexion...', clearChat: 'Effacer le Chat', welcome: 'Bonjour! Je suis votre assistant IA FIFA 2026. Comment puis-je vous aider?', errorResponse: 'Désolé, une erreur est survenue. Veuillez réessayer.' },
    navigation: { title: 'Hub de Navigation Intelligente', subtitle: 'Trouvez le meilleur itinéraire', crowdDensity: 'Densité de Foule', accessibleRoutes: 'Itinéraires Accessibles', shuttleTimes: 'Navettes et Transport', walkingTime: 'Temps de Marche', distance: 'Distance', crowdLevel: 'Niveau de Foule', low: 'Faible', medium: 'Moyen', high: 'Élevé', features: 'Caractéristiques', elevator: 'Ascenseur', ramp: 'Rampe', stairs: 'Escaliers', accessible: 'Accessible en Fauteuil', shuttleWait: 'Temps d\'Attente Navette', minutes: '{{count}} min', nextShuttle: 'Prochaine navette dans', destination: 'Destination', from: 'De', to: 'À' },
    eco: { title: 'Durabilité et Éco-Suivi', subtitle: 'Faites un impact vert', yourPoints: 'Vos Points Verts', carbonSaved: 'Carbone Économisé', treesEquivalent: 'Équivalent Arbres', leaderboard: 'Classement', achievements: 'Succès', actions: 'Gagner des Points', wasteSegregation: 'Tri des Déchets', digitalTicket: 'Billet Numérique', publicTransit: 'Transport Public', refillBottle: 'Bouteille Réutilisable', carbonNeutral: 'Voyage Neutre en Carbone', pointsEarned: '+{{points}} points', rank: 'Rang #{{rank}}', kg: '{{value}} kg CO₂', trees: '{{count}} arbres' },
    crowd: { title: 'Intelligence Opérationnelle', subtitle: 'Gestion de foule en temps réel', totalCapacity: 'Capacité Totale', currentOccupancy: 'Occupation Actuelle', gateStatus: 'État des Portes', chokePoints: 'Points de Congestion', redistribution: 'Redistribution IA', predictions: 'Prédictions', gate: 'Porte {{name}}', throughput: 'Débit', waitTime: 'Temps d\'Attente', capacity: 'Capacité', warning: 'Avertissement', critical: 'Critique', normal: 'Normal', suggestion: 'Suggestion IA', refreshData: 'Actualiser' },
    incidents: { title: 'Gestion des Incidents', subtitle: 'Support décisionnel en temps réel', reportNew: 'Signaler un Incident', activeIncidents: 'Incidents Actifs', resolved: 'Résolus', totalToday: 'Total Aujourd\'hui', avgResponse: 'Réponse Moyenne', category: 'Catégorie', location: 'Emplacement', severity: 'Gravité', description: 'Description', status: 'Statut', protocol: 'Protocole de Réponse', submit: 'Soumettre', categories: { medical: 'Urgence Médicale', security: 'Problème de Sécurité', infrastructure: 'Infrastructure', crowd: 'Contrôle de Foule', weather: 'Alerte Météo', general: 'Général' }, severities: { critical: 'Critique', high: 'Élevé', medium: 'Moyen', low: 'Faible' }, statuses: { reported: 'Signalé', acknowledged: 'Reconnu', inProgress: 'En Cours', resolved: 'Résolu' }, protocolTitle: 'Protocole de Réponse Automatisé', deployPersonnel: 'Déployer le Personnel', estimatedResponse: 'Réponse Estimée', personnelNeeded: 'Personnel Nécessaire' },
    common: { loading: 'Chargement...', error: 'Erreur', retry: 'Réessayer', close: 'Fermer', save: 'Enregistrer', cancel: 'Annuler', confirm: 'Confirmer', search: 'Rechercher', noData: 'Aucune donnée', offline: 'Hors ligne', backToTop: 'Retour en haut', selectVenue: 'Sélectionner le Stade' }
  },

  pt: {
    app: { title: 'FIFA 2026 Estádio Inteligente', subtitle: 'Portal de Comando e Torcedor' },
    nav: { fanHome: 'Painel do Torcedor', assistant: 'Assistente IA', navigation: 'Navegação Inteligente', eco: 'Eco Rastreador', orgHome: 'Centro de Comando', crowd: 'Inteligência de Multidão', incidents: 'Incidentes', switchToFan: 'Modo Torcedor', switchToOrg: 'Modo Equipe' },
    fan: { welcome: 'Bem-vindo à Copa do Mundo FIFA 2026', subtitle: 'Seu companheiro inteligente para o dia do jogo', quickActions: 'Ações Rápidas', askAssistant: 'Perguntar à IA', findWay: 'Encontrar Caminho', trackEco: 'Rastrear Impacto', liveMatch: 'Info ao Vivo', nearbyServices: 'Serviços Próximos', matchDay: 'Dia de Jogo', todayMatch: 'Jogo de Hoje', kickoff: 'Início', venue: 'Estádio', weather: 'Clima' },
    chat: { title: 'Assistente IA', subtitle: 'Pergunte sobre a Copa do Mundo', placeholder: 'Digite sua pergunta...', send: 'Enviar', voice: 'Entrada de Voz', thinking: 'Pensando...', clearChat: 'Limpar Chat', welcome: 'Olá! Sou seu assistente IA FIFA 2026. Como posso ajudá-lo?', errorResponse: 'Desculpe, ocorreu um erro. Tente novamente.' },
    navigation: { title: 'Hub de Navegação Inteligente', subtitle: 'Encontre a melhor rota', crowdDensity: 'Densidade de Multidão', accessibleRoutes: 'Rotas Acessíveis', shuttleTimes: 'Shuttle e Transporte', walkingTime: 'Tempo de Caminhada', distance: 'Distância', crowdLevel: 'Nível de Multidão', low: 'Baixo', medium: 'Médio', high: 'Alto', features: 'Recursos da Rota', elevator: 'Elevador', ramp: 'Rampa', stairs: 'Escadas', accessible: 'Acessível para Cadeirantes', shuttleWait: 'Tempo de Espera do Shuttle', minutes: '{{count}} min', nextShuttle: 'Próximo shuttle em', destination: 'Destino', from: 'De', to: 'Para' },
    eco: { title: 'Sustentabilidade e Eco-Rastreador', subtitle: 'Cause um impacto verde', yourPoints: 'Seus Pontos Verdes', carbonSaved: 'Carbono Economizado', treesEquivalent: 'Árvores Equivalentes', leaderboard: 'Classificação', achievements: 'Conquistas', actions: 'Ganhar Pontos', wasteSegregation: 'Separação de Lixo', digitalTicket: 'Ingresso Digital', publicTransit: 'Transporte Público', refillBottle: 'Garrafa Reutilizável', carbonNeutral: 'Viagem Carbono Neutro', pointsEarned: '+{{points}} pontos', rank: 'Posição #{{rank}}', kg: '{{value}} kg CO₂', trees: '{{count}} árvores' },
    crowd: { title: 'Inteligência Operacional', subtitle: 'Gestão de multidão em tempo real', totalCapacity: 'Capacidade Total', currentOccupancy: 'Ocupação Atual', gateStatus: 'Status dos Portões', chokePoints: 'Pontos de Congestionamento', redistribution: 'Redistribuição IA', predictions: 'Previsões', gate: 'Portão {{name}}', throughput: 'Fluxo', waitTime: 'Tempo de Espera', capacity: 'Capacidade', warning: 'Alerta', critical: 'Crítico', normal: 'Normal', suggestion: 'Sugestão IA', refreshData: 'Atualizar Dados' },
    incidents: { title: 'Gestão de Incidentes', subtitle: 'Suporte de decisão em tempo real', reportNew: 'Reportar Incidente', activeIncidents: 'Incidentes Ativos', resolved: 'Resolvidos', totalToday: 'Total Hoje', avgResponse: 'Resposta Média', category: 'Categoria', location: 'Localização', severity: 'Gravidade', description: 'Descrição', status: 'Status', protocol: 'Protocolo de Resposta', submit: 'Enviar Relatório', categories: { medical: 'Emergência Médica', security: 'Segurança', infrastructure: 'Infraestrutura', crowd: 'Controle de Multidão', weather: 'Alerta Meteorológico', general: 'Geral' }, severities: { critical: 'Crítico', high: 'Alto', medium: 'Médio', low: 'Baixo' }, statuses: { reported: 'Reportado', acknowledged: 'Reconhecido', inProgress: 'Em Andamento', resolved: 'Resolvido' }, protocolTitle: 'Protocolo de Resposta Automatizado', deployPersonnel: 'Implantar Pessoal', estimatedResponse: 'Resposta Estimada', personnelNeeded: 'Pessoal Necessário' },
    common: { loading: 'Carregando...', error: 'Erro', retry: 'Tentar Novamente', close: 'Fechar', save: 'Salvar', cancel: 'Cancelar', confirm: 'Confirmar', search: 'Pesquisar', noData: 'Sem dados', offline: 'Você está offline', backToTop: 'Voltar ao topo', selectVenue: 'Selecionar Estádio' }
  },

  ar: {
    app: { title: 'فيفا 2026 الملعب الذكي', subtitle: 'بوابة القيادة والمشجعين' },
    nav: { fanHome: 'لوحة المشجع', assistant: 'المساعد الذكي', navigation: 'الملاحة الذكية', eco: 'تتبع البيئة', orgHome: 'مركز القيادة', crowd: 'استخبارات الحشود', incidents: 'الحوادث', switchToFan: 'وضع المشجع', switchToOrg: 'وضع الموظفين' },
    fan: { welcome: 'مرحباً بكم في كأس العالم فيفا 2026', subtitle: 'رفيقك الذكي لتجربة يوم المباراة', quickActions: 'إجراءات سريعة', askAssistant: 'اسأل المساعد الذكي', findWay: 'اعثر على طريقك', trackEco: 'تتبع تأثيرك', liveMatch: 'معلومات المباراة', nearbyServices: 'خدمات قريبة', matchDay: 'يوم المباراة', todayMatch: 'مباراة اليوم', kickoff: 'الانطلاق', venue: 'الملعب', weather: 'الطقس' },
    chat: { title: 'المساعد الذكي', subtitle: 'اسألني عن كأس العالم', placeholder: 'اكتب سؤالك...', send: 'إرسال', voice: 'إدخال صوتي', thinking: 'جارٍ التفكير...', clearChat: 'مسح المحادثة', welcome: 'مرحباً! أنا مساعدك الذكي لفيفا 2026. كيف يمكنني مساعدتك؟', errorResponse: 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.' },
    navigation: { title: 'مركز الملاحة الذكية', subtitle: 'اعثر على أفضل مسار', crowdDensity: 'كثافة الحشود', accessibleRoutes: 'مسارات يسهل الوصول إليها', shuttleTimes: 'الحافلات والنقل', walkingTime: 'وقت المشي', distance: 'المسافة', crowdLevel: 'مستوى الازدحام', low: 'منخفض', medium: 'متوسط', high: 'مرتفع', features: 'مميزات المسار', elevator: 'مصعد', ramp: 'منحدر', stairs: 'سلالم', accessible: 'متاح لذوي الاحتياجات الخاصة', shuttleWait: 'وقت انتظار الحافلة', minutes: '{{count}} دقيقة', nextShuttle: 'الحافلة التالية خلال', destination: 'الوجهة', from: 'من', to: 'إلى' },
    eco: { title: 'الاستدامة والتتبع البيئي', subtitle: 'اصنع تأثيراً أخضر', yourPoints: 'نقاطك الخضراء', carbonSaved: 'الكربون الموفر', treesEquivalent: 'ما يعادل من الأشجار', leaderboard: 'لوحة المتصدرين', achievements: 'الإنجازات', actions: 'اكسب نقاطاً', wasteSegregation: 'فرز النفايات', digitalTicket: 'تذكرة رقمية', publicTransit: 'النقل العام', refillBottle: 'زجاجة قابلة لإعادة التعبئة', carbonNeutral: 'سفر محايد للكربون', pointsEarned: '+{{points}} نقطة', rank: 'المرتبة #{{rank}}', kg: '{{value}} كغ CO₂', trees: '{{count}} شجرة' },
    crowd: { title: 'الاستخبارات التشغيلية', subtitle: 'إدارة الحشود في الوقت الفعلي', totalCapacity: 'السعة الإجمالية', currentOccupancy: 'الإشغال الحالي', gateStatus: 'حالة البوابات', chokePoints: 'نقاط الاختناق', redistribution: 'إعادة التوزيع', predictions: 'التنبؤات', gate: 'البوابة {{name}}', throughput: 'معدل التدفق', waitTime: 'وقت الانتظار', capacity: 'السعة', warning: 'تحذير', critical: 'حرج', normal: 'طبيعي', suggestion: 'اقتراح ذكي', refreshData: 'تحديث البيانات' },
    incidents: { title: 'إدارة الحوادث', subtitle: 'دعم القرار في الوقت الفعلي', reportNew: 'الإبلاغ عن حادث', activeIncidents: 'الحوادث النشطة', resolved: 'المحلولة', totalToday: 'الإجمالي اليوم', avgResponse: 'متوسط الاستجابة', category: 'الفئة', location: 'الموقع', severity: 'الخطورة', description: 'الوصف', status: 'الحالة', protocol: 'بروتوكول الاستجابة', submit: 'إرسال التقرير', categories: { medical: 'طوارئ طبية', security: 'مشكلة أمنية', infrastructure: 'البنية التحتية', crowd: 'التحكم بالحشود', weather: 'تنبيه جوي', general: 'عام' }, severities: { critical: 'حرج', high: 'مرتفع', medium: 'متوسط', low: 'منخفض' }, statuses: { reported: 'مُبلغ', acknowledged: 'مُعترف به', inProgress: 'قيد التنفيذ', resolved: 'محلول' }, protocolTitle: 'بروتوكول الاستجابة الآلي', deployPersonnel: 'نشر الموظفين', estimatedResponse: 'الاستجابة المقدرة', personnelNeeded: 'الموظفين المطلوبين' },
    common: { loading: 'جارٍ التحميل...', error: 'خطأ', retry: 'إعادة المحاولة', close: 'إغلاق', save: 'حفظ', cancel: 'إلغاء', confirm: 'تأكيد', search: 'بحث', noData: 'لا توجد بيانات', offline: 'أنت غير متصل', backToTop: 'العودة للأعلى', selectVenue: 'اختر الملعب' }
  },

  de: {
    app: { title: 'FIFA 2026 Smartes Stadion', subtitle: 'Kommando- & Fan-Portal' },
    nav: { fanHome: 'Fan-Dashboard', assistant: 'KI-Assistent', navigation: 'Smarte Navigation', eco: 'Öko-Tracker', orgHome: 'Kommandozentrale', crowd: 'Menschenmengen-Intelligenz', incidents: 'Vorfälle', switchToFan: 'Fan-Modus', switchToOrg: 'Personal-Modus' },
    fan: { welcome: 'Willkommen zur FIFA Fußball-Weltmeisterschaft 2026', subtitle: 'Ihr smarter Begleiter für das ultimative Spieltagserlebnis', quickActions: 'Schnellaktionen', askAssistant: 'KI fragen', findWay: 'Weg finden', trackEco: 'Impact tracken', liveMatch: 'Live-Spielinfo', nearbyServices: 'Nahe Dienste', matchDay: 'Spieltag', todayMatch: 'Heutiges Spiel', kickoff: 'Anstoß', venue: 'Stadion', weather: 'Wetter' },
    chat: { title: 'KI-Assistent', subtitle: 'Fragen Sie mich zur WM', placeholder: 'Ihre Frage eingeben...', send: 'Senden', voice: 'Spracheingabe', thinking: 'Denke nach...', clearChat: 'Chat löschen', welcome: 'Hallo! Ich bin Ihr FIFA 2026 KI-Assistent. Wie kann ich Ihnen helfen?', errorResponse: 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.' },
    navigation: { title: 'Smarter Navigations-Hub', subtitle: 'Finden Sie die beste Route', crowdDensity: 'Menschendichte', accessibleRoutes: 'Barrierefreie Routen', shuttleTimes: 'Shuttle & Verkehr', walkingTime: 'Gehzeit', distance: 'Entfernung', crowdLevel: 'Menschenmenge', low: 'Niedrig', medium: 'Mittel', high: 'Hoch', features: 'Routenmerkmale', elevator: 'Aufzug', ramp: 'Rampe', stairs: 'Treppen', accessible: 'Rollstuhlgerecht', shuttleWait: 'Shuttle-Wartezeit', minutes: '{{count}} Min', nextShuttle: 'Nächster Shuttle in', destination: 'Ziel', from: 'Von', to: 'Nach' },
    eco: { title: 'Nachhaltigkeit & Öko-Tracker', subtitle: 'Machen Sie einen grünen Unterschied', yourPoints: 'Ihre Grünen Punkte', carbonSaved: 'CO₂ eingespart', treesEquivalent: 'Bäume-Äquivalent', leaderboard: 'Bestenliste', achievements: 'Erfolge', actions: 'Punkte sammeln', wasteSegregation: 'Mülltrennung', digitalTicket: 'Digitales Ticket', publicTransit: 'ÖPNV', refillBottle: 'Nachfüllflasche', carbonNeutral: 'CO₂-neutrale Reise', pointsEarned: '+{{points}} Punkte', rank: 'Rang #{{rank}}', kg: '{{value}} kg CO₂', trees: '{{count}} Bäume' },
    crowd: { title: 'Operative Intelligenz', subtitle: 'Echtzeit-Menschenmengenmanagement', totalCapacity: 'Gesamtkapazität', currentOccupancy: 'Aktuelle Belegung', gateStatus: 'Torstatus', chokePoints: 'Engpässe', redistribution: 'KI-Umverteilung', predictions: 'Vorhersagen', gate: 'Tor {{name}}', throughput: 'Durchsatz', waitTime: 'Wartezeit', capacity: 'Kapazität', warning: 'Warnung', critical: 'Kritisch', normal: 'Normal', suggestion: 'KI-Vorschlag', refreshData: 'Daten aktualisieren' },
    incidents: { title: 'Vorfallmanagement', subtitle: 'Echtzeit-Entscheidungsunterstützung', reportNew: 'Vorfall melden', activeIncidents: 'Aktive Vorfälle', resolved: 'Gelöst', totalToday: 'Gesamt heute', avgResponse: 'Durchschn. Reaktion', category: 'Kategorie', location: 'Ort', severity: 'Schweregrad', description: 'Beschreibung', status: 'Status', protocol: 'Reaktionsprotokoll', submit: 'Bericht senden', categories: { medical: 'Medizinischer Notfall', security: 'Sicherheitsproblem', infrastructure: 'Infrastruktur', crowd: 'Menschenmengenkontrolle', weather: 'Wetterwarnung', general: 'Allgemein' }, severities: { critical: 'Kritisch', high: 'Hoch', medium: 'Mittel', low: 'Niedrig' }, statuses: { reported: 'Gemeldet', acknowledged: 'Bestätigt', inProgress: 'In Bearbeitung', resolved: 'Gelöst' }, protocolTitle: 'Automatisiertes Reaktionsprotokoll', deployPersonnel: 'Personal einsetzen', estimatedResponse: 'Geschätzte Reaktion', personnelNeeded: 'Benötigtes Personal' },
    common: { loading: 'Laden...', error: 'Fehler', retry: 'Erneut versuchen', close: 'Schließen', save: 'Speichern', cancel: 'Abbrechen', confirm: 'Bestätigen', search: 'Suchen', noData: 'Keine Daten', offline: 'Sie sind offline', backToTop: 'Nach oben', selectVenue: 'Stadion auswählen' }
  },

  ja: {
    app: { title: 'FIFA 2026 スマートスタジアム', subtitle: 'コマンド＆ファンポータル' },
    nav: { fanHome: 'ファンダッシュボード', assistant: 'AIアシスタント', navigation: 'スマートナビ', eco: 'エコトラッカー', orgHome: 'コマンドセンター', crowd: '群衆インテリジェンス', incidents: 'インシデント', switchToFan: 'ファンモード', switchToOrg: 'スタッフモード' },
    fan: { welcome: 'FIFA ワールドカップ 2026 へようこそ', subtitle: '最高の試合日体験のためのスマートコンパニオン', quickActions: 'クイックアクション', askAssistant: 'AIに質問', findWay: '道を探す', trackEco: '影響を追跡', liveMatch: 'ライブ試合情報', nearbyServices: '近くのサービス', matchDay: '試合日', todayMatch: '今日の試合', kickoff: 'キックオフ', venue: '会場', weather: '天気' },
    chat: { title: 'AIアシスタント', subtitle: 'ワールドカップについて何でも聞いてください', placeholder: '質問を入力...', send: '送信', voice: '音声入力', thinking: '考え中...', clearChat: 'チャットをクリア', welcome: 'こんにちは！FIFA 2026 AIアシスタントです。どのようにお手伝いできますか？', errorResponse: '申し訳ありません。エラーが発生しました。もう一度お試しください。' },
    navigation: { title: 'スマートナビゲーションハブ', subtitle: '最適なルートを見つけよう', crowdDensity: '混雑度', accessibleRoutes: 'バリアフリールート', shuttleTimes: 'シャトル＆交通', walkingTime: '徒歩時間', distance: '距離', crowdLevel: '混雑レベル', low: '低', medium: '中', high: '高', features: 'ルート特徴', elevator: 'エレベーター', ramp: 'スロープ', stairs: '階段', accessible: '車椅子対応', shuttleWait: 'シャトル待ち時間', minutes: '{{count}}分', nextShuttle: '次のシャトルまで', destination: '目的地', from: '出発', to: '到着' },
    eco: { title: 'サステナビリティ＆エコトラッカー', subtitle: 'グリーンインパクトを作ろう', yourPoints: 'グリーンポイント', carbonSaved: '削減CO₂', treesEquivalent: '植樹相当', leaderboard: 'リーダーボード', achievements: '実績', actions: 'ポイントを獲得', wasteSegregation: 'ゴミ分別', digitalTicket: 'デジタルチケット', publicTransit: '公共交通', refillBottle: 'リフィルボトル', carbonNeutral: 'カーボンニュートラル旅行', pointsEarned: '+{{points}}ポイント', rank: '順位 #{{rank}}', kg: '{{value}} kg CO₂', trees: '{{count}}本' },
    crowd: { title: 'オペレーショナルインテリジェンス', subtitle: 'リアルタイム群衆管理', totalCapacity: '総収容人数', currentOccupancy: '現在の入場者数', gateStatus: 'ゲート状況', chokePoints: 'ボトルネック', redistribution: 'AI再分配', predictions: '予測', gate: 'ゲート {{name}}', throughput: 'スループット', waitTime: '待ち時間', capacity: '容量', warning: '警告', critical: '危機的', normal: '正常', suggestion: 'AI提案', refreshData: 'データ更新' },
    incidents: { title: 'インシデント管理', subtitle: 'リアルタイム意思決定支援', reportNew: 'インシデント報告', activeIncidents: 'アクティブ', resolved: '解決済み', totalToday: '本日合計', avgResponse: '平均応答', category: 'カテゴリ', location: '場所', severity: '重大度', description: '説明', status: 'ステータス', protocol: '対応プロトコル', submit: '報告送信', categories: { medical: '医療緊急', security: 'セキュリティ', infrastructure: 'インフラ', crowd: '群衆制御', weather: '気象警報', general: '一般' }, severities: { critical: '危機的', high: '高', medium: '中', low: '低' }, statuses: { reported: '報告済み', acknowledged: '確認済み', inProgress: '対応中', resolved: '解決済み' }, protocolTitle: '自動対応プロトコル', deployPersonnel: '人員配置', estimatedResponse: '推定応答時間', personnelNeeded: '必要人員' },
    common: { loading: '読み込み中...', error: 'エラー', retry: '再試行', close: '閉じる', save: '保存', cancel: 'キャンセル', confirm: '確認', search: '検索', noData: 'データなし', offline: 'オフライン', backToTop: 'トップへ戻る', selectVenue: '会場を選択' }
  },

  ko: {
    app: { title: 'FIFA 2026 스마트 스타디움', subtitle: '커맨드 & 팬 포털' },
    nav: { fanHome: '팬 대시보드', assistant: 'AI 어시스턴트', navigation: '스마트 내비', eco: '에코 트래커', orgHome: '커맨드 센터', crowd: '군중 인텔리전스', incidents: '사건', switchToFan: '팬 모드', switchToOrg: '스태프 모드' },
    fan: { welcome: 'FIFA 월드컵 2026에 오신 것을 환영합니다', subtitle: '최고의 경기일 경험을 위한 스마트 동반자', quickActions: '빠른 작업', askAssistant: 'AI에게 질문', findWay: '길 찾기', trackEco: '영향 추적', liveMatch: '실시간 경기 정보', nearbyServices: '주변 서비스', matchDay: '경기일', todayMatch: '오늘 경기', kickoff: '킥오프', venue: '경기장', weather: '날씨' },
    chat: { title: 'AI 어시스턴트', subtitle: '월드컵에 대해 물어보세요', placeholder: '질문을 입력하세요...', send: '전송', voice: '음성 입력', thinking: '생각 중...', clearChat: '채팅 지우기', welcome: '안녕하세요! FIFA 2026 AI 어시스턴트입니다. 무엇을 도와드릴까요?', errorResponse: '죄송합니다, 오류가 발생했습니다. 다시 시도해 주세요.' },
    navigation: { title: '스마트 내비게이션 허브', subtitle: '최적의 경로를 찾아보세요', crowdDensity: '군중 밀도', accessibleRoutes: '접근 가능 경로', shuttleTimes: '셔틀 & 교통', walkingTime: '도보 시간', distance: '거리', crowdLevel: '혼잡도', low: '낮음', medium: '보통', high: '높음', features: '경로 특징', elevator: '엘리베이터', ramp: '경사로', stairs: '계단', accessible: '휠체어 접근 가능', shuttleWait: '셔틀 대기 시간', minutes: '{{count}}분', nextShuttle: '다음 셔틀까지', destination: '목적지', from: '출발', to: '도착' },
    eco: { title: '지속가능성 & 에코 트래커', subtitle: '그린 임팩트를 만드세요', yourPoints: '그린 포인트', carbonSaved: '탄소 절감', treesEquivalent: '나무 상당', leaderboard: '리더보드', achievements: '업적', actions: '포인트 획득', wasteSegregation: '쓰레기 분리', digitalTicket: '디지털 티켓', publicTransit: '대중교통', refillBottle: '리필 보틀', carbonNeutral: '탄소 중립 여행', pointsEarned: '+{{points}} 포인트', rank: '순위 #{{rank}}', kg: '{{value}} kg CO₂', trees: '{{count}} 그루' },
    crowd: { title: '운영 인텔리전스', subtitle: '실시간 군중 관리', totalCapacity: '총 수용력', currentOccupancy: '현재 수용', gateStatus: '게이트 상태', chokePoints: '병목 구간', redistribution: 'AI 재분배', predictions: '예측', gate: '게이트 {{name}}', throughput: '처리량', waitTime: '대기 시간', capacity: '수용력', warning: '경고', critical: '위험', normal: '정상', suggestion: 'AI 제안', refreshData: '데이터 갱신' },
    incidents: { title: '사건 관리', subtitle: '실시간 의사결정 지원', reportNew: '사건 보고', activeIncidents: '활성 사건', resolved: '해결됨', totalToday: '오늘 총', avgResponse: '평균 응답', category: '카테고리', location: '위치', severity: '심각도', description: '설명', status: '상태', protocol: '대응 프로토콜', submit: '보고 제출', categories: { medical: '의료 응급', security: '보안 문제', infrastructure: '인프라', crowd: '군중 통제', weather: '기상 경보', general: '일반' }, severities: { critical: '위험', high: '높음', medium: '보통', low: '낮음' }, statuses: { reported: '보고됨', acknowledged: '확인됨', inProgress: '진행 중', resolved: '해결됨' }, protocolTitle: '자동 대응 프로토콜', deployPersonnel: '인원 배치', estimatedResponse: '예상 응답 시간', personnelNeeded: '필요 인원' },
    common: { loading: '로딩 중...', error: '오류', retry: '재시도', close: '닫기', save: '저장', cancel: '취소', confirm: '확인', search: '검색', noData: '데이터 없음', offline: '오프라인', backToTop: '맨 위로', selectVenue: '경기장 선택' }
  },

  zh: {
    app: { title: 'FIFA 2026 智慧球场', subtitle: '指挥与球迷门户' },
    nav: { fanHome: '球迷面板', assistant: 'AI助手', navigation: '智能导航', eco: '环保追踪', orgHome: '指挥中心', crowd: '人群情报', incidents: '事件管理', switchToFan: '球迷模式', switchToOrg: '工作人员模式' },
    fan: { welcome: '欢迎来到2026年FIFA世界杯', subtitle: '您的比赛日智能伙伴', quickActions: '快捷操作', askAssistant: '询问AI', findWay: '找路', trackEco: '追踪影响', liveMatch: '实时比赛', nearbyServices: '附近服务', matchDay: '比赛日', todayMatch: '今日比赛', kickoff: '开球', venue: '场馆', weather: '天气' },
    chat: { title: 'AI助手', subtitle: '关于世界杯的一切尽管问', placeholder: '输入您的问题...', send: '发送', voice: '语音输入', thinking: '思考中...', clearChat: '清除聊天', welcome: '您好！我是FIFA 2026 AI助手。有什么可以帮您的？', errorResponse: '抱歉，处理请求时出现错误。请重试。' },
    navigation: { title: '智能导航中心', subtitle: '找到最佳路线', crowdDensity: '人群密度', accessibleRoutes: '无障碍路线', shuttleTimes: '班车与交通', walkingTime: '步行时间', distance: '距离', crowdLevel: '拥挤程度', low: '低', medium: '中', high: '高', features: '路线特点', elevator: '电梯', ramp: '坡道', stairs: '楼梯', accessible: '轮椅无障碍', shuttleWait: '班车等待时间', minutes: '{{count}}分钟', nextShuttle: '下一班车', destination: '目的地', from: '从', to: '到' },
    eco: { title: '可持续性与环保追踪', subtitle: '创造绿色影响', yourPoints: '绿色积分', carbonSaved: '碳减排量', treesEquivalent: '等效植树', leaderboard: '排行榜', achievements: '成就', actions: '获取积分', wasteSegregation: '垃圾分类', digitalTicket: '电子门票', publicTransit: '公共交通', refillBottle: '可重复使用水瓶', carbonNeutral: '碳中和出行', pointsEarned: '+{{points}}积分', rank: '排名 #{{rank}}', kg: '{{value}} 千克CO₂', trees: '{{count}}棵树' },
    crowd: { title: '运营情报', subtitle: '实时人群管理', totalCapacity: '总容量', currentOccupancy: '当前人数', gateStatus: '入口状态', chokePoints: '拥堵点', redistribution: 'AI重新分配', predictions: '预测', gate: '入口 {{name}}', throughput: '通过量', waitTime: '等待时间', capacity: '容量', warning: '警告', critical: '危急', normal: '正常', suggestion: 'AI建议', refreshData: '刷新数据' },
    incidents: { title: '事件管理', subtitle: '实时决策支持', reportNew: '报告事件', activeIncidents: '活跃事件', resolved: '已解决', totalToday: '今日总计', avgResponse: '平均响应', category: '类别', location: '位置', severity: '严重程度', description: '描述', status: '状态', protocol: '响应协议', submit: '提交报告', categories: { medical: '医疗紧急', security: '安全问题', infrastructure: '基础设施', crowd: '人群控制', weather: '天气预警', general: '一般' }, severities: { critical: '危急', high: '高', medium: '中', low: '低' }, statuses: { reported: '已报告', acknowledged: '已确认', inProgress: '进行中', resolved: '已解决' }, protocolTitle: '自动响应协议', deployPersonnel: '部署人员', estimatedResponse: '预计响应时间', personnelNeeded: '所需人员' },
    common: { loading: '加载中...', error: '错误', retry: '重试', close: '关闭', save: '保存', cancel: '取消', confirm: '确认', search: '搜索', noData: '暂无数据', offline: '离线', backToTop: '回到顶部', selectVenue: '选择场馆' }
  },

  hi: {
    app: { title: 'FIFA 2026 स्मार्ट स्टेडियम', subtitle: 'कमांड और फैन पोर्टल' },
    nav: { fanHome: 'फैन डैशबोर्ड', assistant: 'AI सहायक', navigation: 'स्मार्ट नेविगेशन', eco: 'ईको ट्रैकर', orgHome: 'कमांड सेंटर', crowd: 'भीड़ खुफिया', incidents: 'घटनाएँ', switchToFan: 'फैन मोड', switchToOrg: 'स्टाफ मोड' },
    fan: { welcome: 'FIFA विश्व कप 2026 में आपका स्वागत है', subtitle: 'मैच डे अनुभव के लिए आपका स्मार्ट साथी', quickActions: 'त्वरित कार्य', askAssistant: 'AI से पूछें', findWay: 'रास्ता खोजें', trackEco: 'प्रभाव ट्रैक करें', liveMatch: 'लाइव मैच जानकारी', nearbyServices: 'नजदीकी सेवाएँ', matchDay: 'मैच डे', todayMatch: 'आज का मैच', kickoff: 'किकऑफ', venue: 'स्टेडियम', weather: 'मौसम' },
    chat: { title: 'AI सहायक', subtitle: 'विश्व कप के बारे में कुछ भी पूछें', placeholder: 'अपना सवाल लिखें...', send: 'भेजें', voice: 'वॉइस इनपुट', thinking: 'सोच रहा हूँ...', clearChat: 'चैट साफ करें', welcome: 'नमस्ते! मैं आपका FIFA 2026 AI सहायक हूँ। कैसे मदद कर सकता हूँ?', errorResponse: 'क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।' },
    navigation: { title: 'स्मार्ट नेविगेशन हब', subtitle: 'सर्वोत्तम मार्ग खोजें', crowdDensity: 'भीड़ घनत्व', accessibleRoutes: 'सुलभ मार्ग', shuttleTimes: 'शटल और परिवहन', walkingTime: 'पैदल समय', distance: 'दूरी', crowdLevel: 'भीड़ स्तर', low: 'कम', medium: 'मध्यम', high: 'अधिक', features: 'मार्ग विशेषताएँ', elevator: 'लिफ्ट', ramp: 'रैंप', stairs: 'सीढ़ियाँ', accessible: 'व्हीलचेयर सुलभ', shuttleWait: 'शटल प्रतीक्षा समय', minutes: '{{count}} मिनट', nextShuttle: 'अगला शटल', destination: 'गंतव्य', from: 'से', to: 'तक' },
    eco: { title: 'स्थिरता और ईको-ट्रैकर', subtitle: 'हरा प्रभाव डालें', yourPoints: 'आपके ग्रीन पॉइंट्स', carbonSaved: 'कार्बन बचत', treesEquivalent: 'पेड़ समतुल्य', leaderboard: 'लीडरबोर्ड', achievements: 'उपलब्धियाँ', actions: 'पॉइंट्स कमाएँ', wasteSegregation: 'कचरा पृथक्करण', digitalTicket: 'डिजिटल टिकट', publicTransit: 'सार्वजनिक परिवहन', refillBottle: 'रीफिल बोतल', carbonNeutral: 'कार्बन न्यूट्रल यात्रा', pointsEarned: '+{{points}} पॉइंट्स', rank: 'रैंक #{{rank}}', kg: '{{value}} किग्रा CO₂', trees: '{{count}} पेड़' },
    crowd: { title: 'परिचालन खुफिया', subtitle: 'रीयल-टाइम भीड़ प्रबंधन', totalCapacity: 'कुल क्षमता', currentOccupancy: 'वर्तमान अधिभोग', gateStatus: 'गेट स्थिति', chokePoints: 'अड़चन बिंदु', redistribution: 'AI पुनर्वितरण', predictions: 'पूर्वानुमान', gate: 'गेट {{name}}', throughput: 'प्रवाह', waitTime: 'प्रतीक्षा समय', capacity: 'क्षमता', warning: 'चेतावनी', critical: 'गंभीर', normal: 'सामान्य', suggestion: 'AI सुझाव', refreshData: 'डेटा रिफ्रेश करें' },
    incidents: { title: 'घटना प्रबंधन', subtitle: 'रीयल-टाइम निर्णय सहायता', reportNew: 'घटना रिपोर्ट करें', activeIncidents: 'सक्रिय घटनाएँ', resolved: 'हल की गईं', totalToday: 'आज कुल', avgResponse: 'औसत प्रतिक्रिया', category: 'श्रेणी', location: 'स्थान', severity: 'गंभीरता', description: 'विवरण', status: 'स्थिति', protocol: 'प्रतिक्रिया प्रोटोकॉल', submit: 'रिपोर्ट भेजें', categories: { medical: 'चिकित्सा आपातकाल', security: 'सुरक्षा समस्या', infrastructure: 'बुनियादी ढांचा', crowd: 'भीड़ नियंत्रण', weather: 'मौसम चेतावनी', general: 'सामान्य' }, severities: { critical: 'गंभीर', high: 'उच्च', medium: 'मध्यम', low: 'निम्न' }, statuses: { reported: 'रिपोर्ट किया गया', acknowledged: 'स्वीकृत', inProgress: 'प्रगति में', resolved: 'हल किया गया' }, protocolTitle: 'स्वचालित प्रतिक्रिया प्रोटोकॉल', deployPersonnel: 'कर्मी तैनात करें', estimatedResponse: 'अनुमानित प्रतिक्रिया', personnelNeeded: 'आवश्यक कर्मी' },
    common: { loading: 'लोड हो रहा है...', error: 'त्रुटि', retry: 'पुनः प्रयास', close: 'बंद करें', save: 'सहेजें', cancel: 'रद्द करें', confirm: 'पुष्टि करें', search: 'खोजें', noData: 'कोई डेटा नहीं', offline: 'ऑफलाइन', backToTop: 'ऊपर जाएँ', selectVenue: 'स्टेडियम चुनें' }
  },

  it: {
    app: { title: 'FIFA 2026 Stadio Intelligente', subtitle: 'Portale Comando e Tifosi' },
    nav: { fanHome: 'Dashboard Tifoso', assistant: 'Assistente IA', navigation: 'Navigazione Smart', eco: 'Eco Tracker', orgHome: 'Centro Comando', crowd: 'Intelligence Folla', incidents: 'Incidenti', switchToFan: 'Modalità Tifoso', switchToOrg: 'Modalità Staff' },
    fan: { welcome: 'Benvenuti alla Coppa del Mondo FIFA 2026', subtitle: 'Il vostro compagno smart per la giornata di gara', quickActions: 'Azioni Rapide', askAssistant: 'Chiedi all\'IA', findWay: 'Trova la Strada', trackEco: 'Traccia il Tuo Impatto', liveMatch: 'Info Partita Live', nearbyServices: 'Servizi Vicini', matchDay: 'Giorno di Gara', todayMatch: 'Partita di Oggi', kickoff: 'Calcio d\'inizio', venue: 'Stadio', weather: 'Meteo' },
    chat: { title: 'Assistente IA', subtitle: 'Chiedimi del Mondiale', placeholder: 'Scrivi la tua domanda...', send: 'Invia', voice: 'Input Vocale', thinking: 'Sto pensando...', clearChat: 'Cancella Chat', welcome: 'Ciao! Sono il tuo assistente IA FIFA 2026. Come posso aiutarti?', errorResponse: 'Mi dispiace, si è verificato un errore. Riprova.' },
    navigation: { title: 'Hub di Navigazione Intelligente', subtitle: 'Trova il percorso migliore', crowdDensity: 'Densità Folla', accessibleRoutes: 'Percorsi Accessibili', shuttleTimes: 'Navette e Trasporti', walkingTime: 'Tempo a Piedi', distance: 'Distanza', crowdLevel: 'Livello Folla', low: 'Basso', medium: 'Medio', high: 'Alto', features: 'Caratteristiche Percorso', elevator: 'Ascensore', ramp: 'Rampa', stairs: 'Scale', accessible: 'Accessibile in Sedia a Rotelle', shuttleWait: 'Tempo Attesa Navetta', minutes: '{{count}} min', nextShuttle: 'Prossima navetta tra', destination: 'Destinazione', from: 'Da', to: 'A' },
    eco: { title: 'Sostenibilità ed Eco-Tracker', subtitle: 'Fai un impatto verde', yourPoints: 'I Tuoi Punti Verdi', carbonSaved: 'Carbonio Risparmiato', treesEquivalent: 'Alberi Equivalenti', leaderboard: 'Classifica', achievements: 'Traguardi', actions: 'Guadagna Punti', wasteSegregation: 'Raccolta Differenziata', digitalTicket: 'Biglietto Digitale', publicTransit: 'Trasporto Pubblico', refillBottle: 'Bottiglia Riutilizzabile', carbonNeutral: 'Viaggio Neutro in Carbonio', pointsEarned: '+{{points}} punti', rank: 'Posizione #{{rank}}', kg: '{{value}} kg CO₂', trees: '{{count}} alberi' },
    crowd: { title: 'Intelligence Operativa', subtitle: 'Gestione folla in tempo reale', totalCapacity: 'Capacità Totale', currentOccupancy: 'Occupazione Attuale', gateStatus: 'Stato Ingressi', chokePoints: 'Punti di Congestione', redistribution: 'Ridistribuzione IA', predictions: 'Previsioni', gate: 'Ingresso {{name}}', throughput: 'Portata', waitTime: 'Tempo di Attesa', capacity: 'Capacità', warning: 'Avvertimento', critical: 'Critico', normal: 'Normale', suggestion: 'Suggerimento IA', refreshData: 'Aggiorna Dati' },
    incidents: { title: 'Gestione Incidenti', subtitle: 'Supporto decisionale in tempo reale', reportNew: 'Segnala Incidente', activeIncidents: 'Incidenti Attivi', resolved: 'Risolti', totalToday: 'Totale Oggi', avgResponse: 'Risposta Media', category: 'Categoria', location: 'Posizione', severity: 'Gravità', description: 'Descrizione', status: 'Stato', protocol: 'Protocollo di Risposta', submit: 'Invia Segnalazione', categories: { medical: 'Emergenza Medica', security: 'Problema Sicurezza', infrastructure: 'Infrastruttura', crowd: 'Controllo Folla', weather: 'Allerta Meteo', general: 'Generale' }, severities: { critical: 'Critico', high: 'Alto', medium: 'Medio', low: 'Basso' }, statuses: { reported: 'Segnalato', acknowledged: 'Confermato', inProgress: 'In Corso', resolved: 'Risolto' }, protocolTitle: 'Protocollo di Risposta Automatizzato', deployPersonnel: 'Dispiegare Personale', estimatedResponse: 'Risposta Stimata', personnelNeeded: 'Personale Necessario' },
    common: { loading: 'Caricamento...', error: 'Errore', retry: 'Riprova', close: 'Chiudi', save: 'Salva', cancel: 'Annulla', confirm: 'Conferma', search: 'Cerca', noData: 'Nessun dato', offline: 'Sei offline', backToTop: 'Torna in cima', selectVenue: 'Seleziona Stadio' }
  },

  nl: {
    app: { title: 'FIFA 2026 Smart Stadion', subtitle: 'Commando- & Fan Portaal' },
    nav: { fanHome: 'Fan Dashboard', assistant: 'AI Assistent', navigation: 'Slimme Navigatie', eco: 'Eco Tracker', orgHome: 'Commandocentrum', crowd: 'Menigte Intelligence', incidents: 'Incidenten', switchToFan: 'Fan Modus', switchToOrg: 'Personeel Modus' },
    fan: { welcome: 'Welkom bij het FIFA WK 2026', subtitle: 'Uw slimme metgezel voor de ultieme wedstrijddag', quickActions: 'Snelle Acties', askAssistant: 'Vraag de AI', findWay: 'Vind de Weg', trackEco: 'Volg je Impact', liveMatch: 'Live Wedstrijd Info', nearbyServices: 'Diensten in de Buurt', matchDay: 'Wedstrijddag', todayMatch: 'Wedstrijd Vandaag', kickoff: 'Aftrap', venue: 'Stadion', weather: 'Weer' },
    chat: { title: 'AI Assistent', subtitle: 'Vraag me alles over het WK', placeholder: 'Typ je vraag...', send: 'Verstuur', voice: 'Spraak Invoer', thinking: 'Aan het denken...', clearChat: 'Chat Wissen', welcome: 'Hallo! Ik ben je FIFA 2026 AI-assistent. Hoe kan ik je helpen?', errorResponse: 'Sorry, er is een fout opgetreden. Probeer het opnieuw.' },
    navigation: { title: 'Slimme Navigatie Hub', subtitle: 'Vind de beste route', crowdDensity: 'Drukte Dichtheid', accessibleRoutes: 'Toegankelijke Routes', shuttleTimes: 'Shuttle & Vervoer', walkingTime: 'Looptijd', distance: 'Afstand', crowdLevel: 'Drukte Niveau', low: 'Laag', medium: 'Gemiddeld', high: 'Hoog', features: 'Route Kenmerken', elevator: 'Lift', ramp: 'Hellingbaan', stairs: 'Trappen', accessible: 'Rolstoel Toegankelijk', shuttleWait: 'Shuttle Wachttijd', minutes: '{{count}} min', nextShuttle: 'Volgende shuttle over', destination: 'Bestemming', from: 'Van', to: 'Naar' },
    eco: { title: 'Duurzaamheid & Eco-Tracker', subtitle: 'Maak een groene impact', yourPoints: 'Jouw Groene Punten', carbonSaved: 'CO₂ Bespaard', treesEquivalent: 'Bomen Equivalent', leaderboard: 'Ranglijst', achievements: 'Prestaties', actions: 'Punten Verdienen', wasteSegregation: 'Afvalscheiding', digitalTicket: 'Digitaal Ticket', publicTransit: 'Openbaar Vervoer', refillBottle: 'Hervulbare Fles', carbonNeutral: 'CO₂-neutrale Reis', pointsEarned: '+{{points}} punten', rank: 'Rang #{{rank}}', kg: '{{value}} kg CO₂', trees: '{{count}} bomen' },
    crowd: { title: 'Operationele Intelligentie', subtitle: 'Realtime menigtebeheer', totalCapacity: 'Totale Capaciteit', currentOccupancy: 'Huidige Bezetting', gateStatus: 'Poort Status', chokePoints: 'Knelpunten', redistribution: 'AI Herverdeling', predictions: 'Voorspellingen', gate: 'Poort {{name}}', throughput: 'Doorvoer', waitTime: 'Wachttijd', capacity: 'Capaciteit', warning: 'Waarschuwing', critical: 'Kritiek', normal: 'Normaal', suggestion: 'AI Suggestie', refreshData: 'Data Vernieuwen' },
    incidents: { title: 'Incidentbeheer', subtitle: 'Realtime beslissingsondersteuning', reportNew: 'Incident Melden', activeIncidents: 'Actieve Incidenten', resolved: 'Opgelost', totalToday: 'Totaal Vandaag', avgResponse: 'Gem. Reactie', category: 'Categorie', location: 'Locatie', severity: 'Ernst', description: 'Beschrijving', status: 'Status', protocol: 'Reactie Protocol', submit: 'Rapport Indienen', categories: { medical: 'Medisch Noodgeval', security: 'Beveiligingsprobleem', infrastructure: 'Infrastructuur', crowd: 'Menigte Controle', weather: 'Weer Waarschuwing', general: 'Algemeen' }, severities: { critical: 'Kritiek', high: 'Hoog', medium: 'Gemiddeld', low: 'Laag' }, statuses: { reported: 'Gemeld', acknowledged: 'Bevestigd', inProgress: 'In Behandeling', resolved: 'Opgelost' }, protocolTitle: 'Geautomatiseerd Reactie Protocol', deployPersonnel: 'Personeel Inzetten', estimatedResponse: 'Geschatte Reactie', personnelNeeded: 'Benodigd Personeel' },
    common: { loading: 'Laden...', error: 'Fout', retry: 'Opnieuw', close: 'Sluiten', save: 'Opslaan', cancel: 'Annuleren', confirm: 'Bevestigen', search: 'Zoeken', noData: 'Geen data', offline: 'Je bent offline', backToTop: 'Terug naar boven', selectVenue: 'Selecteer Stadion' }
  }
};

export { translations };
