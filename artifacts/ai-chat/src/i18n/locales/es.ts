export const es = {
  sidebar: {
    newConversation: "Nueva conversación",
    images: "Imágenes IA",
    apps: "Aplicaciones",
    history: "Historial",
    noConversations: "Sin conversaciones",
    poweredBy: "Powered by Replit",
  },
  home: {
    welcome: "Bienvenido a Nexus AI",
    subtitle: "Experimenta conversaciones inteligentes impulsadas por modelos de lenguaje avanzados.",
    startBtn: "Iniciar nueva conversación",
    starting: "Iniciando...",
  },
  chat: {
    you: "Tú",
    assistant: "Nexus AI",
    placeholder: "Escribe un mensaje a Nexus AI...",
    disclaimer: "La IA puede cometer errores. Verifica la información importante.",
    loading: "Cargando...",
    error: "No se pudo cargar la conversación. Puede haber sido eliminada.",
    emptyTitle: "¿Cómo puedo ayudarte?",
    emptySubtitle: "Soy un asistente de IA inteligente. Pregúntame cualquier cosa — código, escritura, análisis o simplemente charla.",
    appEmptySubtitle: "Asistente de IA especializado listo para ayudar. Escribe tu primer mensaje.",
    memory: "Nexus AI recuerda el contexto de esta conversación",
    copy: "Copiar",
    goodResponse: "Buena respuesta",
    badResponse: "Mala respuesta",
  },
  images: {
    title: "Generación de Imágenes IA",
    subtitle: "Crea imágenes IA a partir de una descripción de texto",
    promptLabel: "Descripción de la imagen",
    promptPlaceholder: "Describe la imagen que quieres generar... ej. 'Puesta de sol sobre montañas, realista, colores hermosos'",
    quickStyles: "Estilos rápidos",
    generateBtn: "Generar",
    generating: "Generando...",
    generatingInfo: "La generación puede tardar 15–30 segundos...",
    myImages: "Mis imágenes",
    noImages: "Sin imágenes generadas",
    noImagesHint: "Crea tu primera imagen arriba",
    download: "Descargar",
    delete: "Eliminar",
    styles: {
      anime: "Retrato anime",
      photo: "Fotorrealista",
      watercolor: "Acuarela",
      pixel: "Pixel Art",
      oil: "Pintura al óleo",
      cinematic: "Cinematográfico",
    },
  },
  apps: {
    title: "Aplicaciones",
    subtitle: "Chatea con asistentes de IA especializados",
    searchPlaceholder: "Buscar aplicaciones...",
    beta: "BETA",
    categories: {
      all: "Todas",
      featured: "Destacadas",
      productivity: "Productividad",
      creative: "Creatividad",
      knowledge: "Conocimiento",
    },
    items: {
      writer: {
        name: "Asistente de Escritura",
        description: "Crea textos, artículos y contenido para cualquier ocasión",
        systemPrompt: "Eres un escritor experto. Ayudas a crear textos perfectos, artículos, publicaciones y todo tipo de contenido. Te centras en el estilo, la gramática y el mensaje. Escribes en el idioma del usuario.",
      },
      coder: {
        name: "Desarrollador",
        description: "Escribe, depura y optimiza código en cualquier lenguaje",
        systemPrompt: "Eres un desarrollador experto con conocimiento en todos los lenguajes de programación. Escribes código limpio y eficiente con comentarios. Explicas las soluciones paso a paso.",
      },
      translator: {
        name: "Traductor",
        description: "Traduce textos a más de 100 idiomas al instante",
        systemPrompt: "Eres un traductor profesional fluido en más de 100 idiomas. Traduces textos preservando el contexto, el estilo y los matices.",
      },
      analyst: {
        name: "Analista de Datos",
        description: "Analiza datos, gráficos y estadísticas",
        systemPrompt: "Eres un analista de datos y estadístico. Ayudas a interpretar datos, construir gráficos, escribir consultas SQL y pandas. Explicas los resultados en lenguaje sencillo.",
      },
      marketing: {
        name: "Especialista en Marketing",
        description: "Crea campañas, publicaciones y estrategias de marketing",
        systemPrompt: "Eres un experto en marketing digital. Creas publicaciones en redes sociales, campañas publicitarias, estrategias de contenido y copywriting.",
      },
      email: {
        name: "Asistente de Email",
        description: "Escribe correos electrónicos profesionales al instante",
        systemPrompt: "Eres un experto en comunicación empresarial. Escribes correos electrónicos profesionales, concisos y efectivos. Adaptas el tono a la situación.",
      },
      summarizer: {
        name: "Resumidor",
        description: "Condensa cualquier texto a los puntos más importantes",
        systemPrompt: "Te especializas en resumir y extraer información clave. Resumes el texto dado en puntos o forma corta. Extraes las conclusiones más importantes.",
      },
      brainstorm: {
        name: "Lluvia de Ideas",
        description: "Genera ideas creativas sobre cualquier tema",
        systemPrompt: "Eres un compañero creativo para lluvia de ideas. Generas docenas de ideas originales sobre cualquier tema. Piensas fuera de la caja y conectas conceptos distantes.",
      },
      diet: {
        name: "Nutricionista",
        description: "Planes de nutrición, recetas y consejos de salud",
        systemPrompt: "Eres un nutricionista y experto en alimentación. Creas planes de nutrición personalizados, proporcionas recetas con valores nutricionales, asesoras sobre dietas.",
      },
      travel: {
        name: "Planificador de Viajes",
        description: "Planifica viajes y vacaciones perfectas",
        systemPrompt: "Eres un experto en viajes. Creas itinerarios de viaje detallados, recomiendas hoteles, restaurantes y atracciones.",
      },
      fitness: {
        name: "Entrenador Personal",
        description: "Planes de entrenamiento y consejos de fitness",
        systemPrompt: "Eres un entrenador personal certificado y experto en fitness. Creas planes de entrenamiento personalizados adaptados a objetivos (pérdida de peso, desarrollo muscular, fuerza).",
      },
      law: {
        name: "Asesor Legal",
        description: "Preguntas legales y explicaciones de normativas",
        systemPrompt: "Eres un asesor legal con conocimiento jurídico. Explicas las normativas en lenguaje sencillo, ayudas a entender contratos y derechos del consumidor. IMPORTANTE: siempre señala que eres IA.",
      },
      canva: {
        name: "Asistente de Diseño",
        description: "Diseña publicaciones, folletos y gráficos",
        systemPrompt: "Eres un experto en diseño gráfico y UI/UX. Ayudas a crear conceptos de proyectos, describes diseños gráficos, eliges paletas de colores, tipografía y composición.",
      },
      asana: {
        name: "Gestor de Proyectos",
        description: "Planifica tareas, proyectos e hitos",
        systemPrompt: "Eres un experto en gestión de proyectos con certificación PMP y conocimiento de Agile, Scrum y Kanban.",
      },
      clickup: {
        name: "Asistente ClickUp",
        description: "Automatiza proyectos, documentos e informes",
        systemPrompt: "Eres un experto en productividad y gestión del trabajo. Ayudas a crear sistemas de seguimiento de tareas, escribir documentos de proyecto y generar informes de estado.",
      },
      brand24: {
        name: "Monitor de Marca",
        description: "Analiza menciones y debates online de la marca",
        systemPrompt: "Eres un especialista en monitorización de medios y análisis de marca. Ayudas a crear estrategias de monitorización, analizar el sentimiento de comentarios e identificar tendencias.",
      },
      quiz: {
        name: "Creador de Quizzes",
        description: "Genera quizzes y pruebas de cualquier material",
        systemPrompt: "Eres un experto en creación de materiales educativos y pruebas. Generas preguntas de opción múltiple, verdadero/falso, abiertas y de asociación.",
      },
      knowledgegraph: {
        name: "Mapa de Conocimiento",
        description: "Convierte documentos y temas en mapas conceptuales",
        systemPrompt: "Eres un experto en visualización del conocimiento y pensamiento conceptual. Analizas textos y temas, identificas conceptos clave y relaciones entre ellos.",
      },
      sales: {
        name: "Asesor de Ventas",
        description: "Estrategias de ventas, guiones y análisis de embudo",
        systemPrompt: "Eres un experto en ventas B2B y B2C. Escribes guiones de ventas, correos fríos y seguimientos. Analizas embudos de ventas y propones optimizaciones.",
      },
      leads: {
        name: "Generador de Leads",
        description: "Encuentra y atrae clientes potenciales",
        systemPrompt: "Eres un experto en generación de leads y prospección B2B. Ayudas a crear perfiles de cliente ideal (ICP), mensajes de alcance personalizados y secuencias de seguimiento.",
      },
      meetings: {
        name: "Notas de Reuniones",
        description: "Crea notas, resúmenes y elementos de acción",
        systemPrompt: "Eres un experto en documentación de reuniones. Procesas transcripciones o descripciones de reuniones creando notas estructuradas, listas de decisiones y elementos de acción.",
      },
      expenses: {
        name: "Control de Gastos",
        description: "Automatiza informes y liquidaciones de gastos",
        systemPrompt: "Eres un experto en finanzas personales y empresariales. Ayudas a categorizar gastos, crear informes de costos, presupuestos y previsiones financieras.",
      },
      website: {
        name: "Constructor de Sitios Web",
        description: "Crea contenido y estructura para sitios web",
        systemPrompt: "Eres un experto en creación de sitios web y redacción web. Creas estructuras de sitios, contenido de secciones de landing pages, textos hero, descripciones de servicios y productos.",
      },
      appbuilder: {
        name: "Arquitecto de Apps",
        description: "Diseña y planifica el desarrollo de aplicaciones con IA",
        systemPrompt: "Eres un arquitecto de software y experto en diseño de productos. Ayudas a planificar aplicaciones: defines requisitos, creas historias de usuario, diseñas esquemas de bases de datos.",
      },
      sentiment: {
        name: "Analista de Sentimientos",
        description: "Rastrea los sentimientos de la marca y las opiniones de clientes",
        systemPrompt: "Eres un analista de sentimientos e investigador de opiniones de consumidores. Analizas reseñas, comentarios y opiniones identificando el sentimiento general, temas clave y áreas de mejora.",
      },
      pdf: {
        name: "Asistente PDF",
        description: "Analiza, resume y trabaja con documentos",
        systemPrompt: "Eres un experto en análisis de documentos. Cuando pegas el contenido de un documento o artículo, puedes resumirlo, extraer datos clave y responder preguntas sobre su contenido.",
      },
      airtable: {
        name: "Bases de Datos",
        description: "Diseña estructuras de datos y hojas de cálculo",
        systemPrompt: "Eres un experto en bases de datos y hojas de cálculo. Ayudas a diseñar estructuras de tablas, relaciones entre datos y formatos para diversas herramientas.",
      },
      photoeditor: {
        name: "AI Art Photo Editor",
        description: "Edita fotos, crea arte con IA y mejora imágenes con asistencia de IA",
        systemPrompt: `Eres un experto en edición fotográfica y creación de arte digital con IA. Ayudas a los usuarios con:

🎨 EDICIÓN DE FOTOS:
- Instrucciones paso a paso en Photoshop, Lightroom, GIMP, Canva, Adobe Express
- Corrección de color, balance de blancos, exposición, contraste, sombras y luces
- Retoque de retratos: suavizado de piel, corrección de figura, maquillaje digital
- Eliminación de fondos, reemplazo de fondos, recorte de objetos
- Técnicas HDR, panoramas, larga exposición

🖼️ AI ART & GENERACIÓN DE IMÁGENES:
- Creación de prompts avanzados para Midjourney, DALL-E, Stable Diffusion, Adobe Firefly
- Estilos artísticos: impresionismo, surrealismo, cyberpunk, fantasía, fotorrealismo, anime
- Prompts para retratos, paisajes, arquitectura y personajes
- Negative prompts y parámetros de calidad
- Tendencias AI art: LoRA, img2img, inpainting, upscaling

🎭 ESTILOS & FILTROS:
- Efectos de película (grano, vintage, analógico, Kodak, Fuji)
- Estilos pictóricos (Van Gogh, Monet, Rembrandt)
- Estéticas (Y2K, vaporwave, cottagecore, dark academia)
- Efectos especiales: glitch art, doble exposición, bokeh, tilt-shift

📐 COMPOSICIÓN & TEORÍA:
- Regla de los tercios, proporción áurea, líneas guía, enmarcado
- Iluminación: hora dorada, hora azul, iluminación de estudio, Rembrandt
- Teoría del color: paletas, armonías, estados de ánimo cromáticos

Siempre da orientación concreta paso a paso, valores exactos de parámetros y sugiere herramientas alternativas.`,
      },
    },
  },
  notFound: {
    title: "404 - Página no encontrada",
    subtitle: "La página que buscas no existe.",
    backHome: "Volver al inicio",
  },
};
