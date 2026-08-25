# RepUp — Train Smarter. Get Stronger. ⚡

RepUp es una aplicación web interactiva diseñada para crear, personalizar y hacer seguimiento de tus rutinas de entrenamiento. Su interfaz cuenta con un diseño de alta gama **Mobile-First** optimizado para su uso cómodo en teléfonos móviles, y adopta la paleta de colores y el estilo exactos del logotipo del proyecto (Negro, Magenta, Cian y Verde Lima).

---

## 📁 Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```text
Repup/
├── assets/
│   └── logo/
│       └── repup-icon.svg     # Icono SVG vectorial brillante (basado en tu diseño de logo)
├── css/
│   └── style.css              # Estilos responsivos con enfoque Mobile-First y variables neón
├── js/
│   └── main.js                # Lógica interactiva de navegación SPA y controles
├── index.html                 # Estructura del dashboard y secciones (vistas)
└── README.md                  # Documentación del proyecto (este archivo)
```

---

## 🎨 Sistema de Diseño Móvil y Estética del Logo

Para lograr una interfaz sumamente limpia y optimizada para móviles, hemos implementado el siguiente sistema en [style.css](file:///c:/Users/agrod/Desktop/WEBS/Repup/css/style.css):

1. **Variables y Colores del Logotipo**:
   * **Fondo Principal**: Negro mate profundo (`#060609`) con un sutil degradado radial e hilos de cuadrícula para dar un aspecto técnico y deportivo.
   * **Tarjetas e Inputs**: Color sólido oscuro (`#111116`) con bordes extra finos (`1px`) que incrementan su brillo al interactuar.
   * **Glows del Logotipo**:
     * **Magenta/Violeta (`#ff00aa` / `#c600ff`)**: Utilizado para la selección de días, botones secundarios e indicador de AI.
     * **Azul/Cian (`#0055ff` / `#00d0ff`)**: Utilizado para botones primarios, la barra de navegación móvil activa, y estados de progreso diario.
     * **Verde Lima (`#b5ff00` / `#39ff14`)**: Utilizado para ejercicios completados y estados de éxito.

2. **Diseño Mobile-First Responsivo**:
   * **Barra de Navegación Inferior (Móvil)**: Fija en la base (`bottom: 0`) con botones de iconos SVG amplios, ideales para la navegación a una mano con el pulgar.
   * **Barra Lateral Tipo Dashboard (Escritorio)**: Al abrir la app en una pantalla grande (ancho >= 768px), la interfaz se transforma automáticamente para mostrar un panel lateral izquierdo permanente y un layout en múltiples columnas.
   * **Tamaños de Toque**: Todos los botones interactivos respetan el estándar móvil de **`48px x 48px`** como área de contacto mínima.
   * **Scroll Horizontal**: La selección de días y los filtros de biblioteca horizontal no se rompen ni se ocultan en pantallas chicas; se desplazan de manera lateral fluida con el dedo.

---

## ⚡ Interactividad en JavaScript

El archivo [main.js](file:///c:/Users/agrod/Desktop/WEBS/Repup/js/main.js) maneja la interactividad del sistema SPA de forma fluida:

* **Navegación Dinámica por Pestañas (SPA)**: Oculta y muestra las secciones (*Inicio*, *Crear*, *Entrenar*, *Progreso* y *Biblioteca*) de forma inmediata sin recargar el navegador, sincronizando las barras de navegación móvil e industrial.
* **Constructor de Rutinas Dinámico**:
  * Pestañas secuenciales interactivas (Objetivo, Experiencia, Disponibilidad y Equipo).
  * Simulación de carga neón al generar la rutina.
  * Inyección automática de ejercicios personalizados en la sección de entrenamiento de hoy según el objetivo (Hipertrofia, Fuerza, Pérdida de Grasa, Condición Física).
* **Registro de Entrenamiento Activo**:
  * Botones circulares grandes de completado (`✓`). Al hacer tap, el ejercicio se tacha en verde neón, vibra el celular ligeramente y actualiza la barra de progreso en la página de inicio.
  * Al completar el 100% de la sesión, se activa un modal de resumen de sesión con estadísticas de volumen.
* **Gráfica de Líneas Neon**:
  * Dibuja dinámicamente un gráfico SVG brillante que adapta sus coordenadas, cuadrículas y tooltips de hover según la escala temporal elegida (8 semanas, 6 meses, 1 año).
* **AI Coach en Bottom Sheet / Side Panel**:
  * En móviles, al tocar el botón del Coach de IA se desliza un panel interactivo desde abajo (Bottom Sheet) con scroll independiente. Permite enviar mensajes y recibir consejos de entrenamiento instantáneos. En escritorio se despliega como un panel lateral derecho.

---

## 🚀 Instrucciones de Uso

1. Abre el archivo [index.html](file:///c:/Users/agrod/Desktop/WEBS/Repup/index.html) en tu navegador preferido.
2. Si estás en escritorio, puedes usar la herramienta de inspección del navegador para simular dispositivos móviles (como iPhone o Android) y experimentar la navegación inferior nativa y los paneles táctiles responsivos.
3. Procede a crear tu rutina, registrar tus ejercicios del día y chatear con el coach de IA para verificar toda la interactividad.
