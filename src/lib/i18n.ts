/**
 * Internationalization (i18n) utility functions
 */

import { useSettingsContext } from "@/contexts/settings-context";
import { DEFAULT_SETTINGS } from "./constants";

// Simple translation dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    // Common
    settings: "Settings",
    save: "Save",
    cancel: "Cancel",
    reset: "Reset",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    confirm: "Confirm",
    delete: "Delete",
    edit: "Edit",
    view: "View",
    add: "Add",
    remove: "Remove",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    refresh: "Refresh",
    welcome: "Welcome",
    today: "Today",
    this_week: "This Week",
    this_month: "This Month",
    this_year: "This Year",
    manager_overview_description:
      "Here's an overview of your store's performance.",
    cashier_overview_description: "Here's a summary of your sales activity.",
    // Breadcrumbs
    dashboard: "Dashboard",
    overview: "Overview",
    // Settings Descriptions
    general_settings_description:
      "Configure basic application information and branding.",
    appearance_settings_description:
      "Customize the application's color scheme and theme.",
    currency_settings_description:
      "Configure the default currency for transactions and pricing.",
    localization_settings_description:
      "Configure language, timezone, and date/time formats.",
    system_settings_description:
      "Configure system-level preferences and maintenance options.",
    maintenance_mode_description:
      "Enable maintenance mode to restrict access to the application.",
    // Search Placeholders
    search_products: "Search products...",
    search_staff: "Search staff by name, username, or role...",
    search_sales_cashier:
      "Search sales by cashier, product, or payment mode...",
    search_sales_product: "Search sales by product or payment mode...",
    search_products_advanced:
      "Search by ID, name, category, price, GTIN, or description...",
    // Overview Components
    active_cashiers: "Active Cashiers",
    low_stock_items: "Low Stock Items",
    currently_active_staff: "Currently active staff",
    needs_attention: "Needs attention",
    all_items_well_stocked: "All items well stocked",
    daily_sales_last_7_days: "Daily Sales (Last 7 Days)",
    revenue_generated_per_day: "Revenue generated per day.",
    weekly_sales_comparison: "Weekly Sales Comparison",
    this_week_vs_last_week: "This week vs. last week.",
    monthly_sales_comparison: "Monthly Sales Comparison",
    total_sales_per_month: "Total sales per month.",
    last_week: "Last Week",
    weekly: "Weekly",
    monthly: "Monthly",
    monthly_last_6_months: "Monthly (Last 6 Months)",
    // Sales
    sales: "Sales",
    sales_history_description: "View and filter sales transactions.",
    record_sale: "Record New Sale",
    record_sale_description:
      "Add products to the cart and complete the transaction.",
    // Inventory
    products: "Products",
    product_name: "Product Name",
    stock: "Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
    add_product: "Add Product",
    edit_product: "Edit Product",
    update_stock: "Update Stock",
    inventory_management_description:
      "View, add, and manage your product stock.",
    add_new_product: "Add New Product",
    add_product_description:
      "Enter the product details. Image URL and GTIN are optional.",
    product_description: "Product Description",
    product_category: "Product Category",
    new_quantity: "Initial Quantity",
    low_stock_margin: "Low Stock Threshold",
    image_url_optional: "Image URL (optional)",
    gtin_optional: "GTIN (optional)",
    inventory: "Inventory",
    no_products_found: "No products found.",
    // Staff
    add_staff: "Add Staff",
    edit_staff: "Edit Staff",
    name: "Name",
    email: "Email",
    role: "Role",
    active: "Active",
    inactive: "Inactive",
    staff_management_description:
      "View staff details, performance, and manage their status.",
    staff_management: "Staff Management",
    no_staff_found: "No staff found.",
    total_sales: "Total Sales",
    number_of_orders: "# Orders",
    actions: "Actions",
    add_new_staff_member: "Add New Staff Member",
    add_staff_description: "Add a new staff member to the system.",
    full_name: "Full Name",
    enter_full_name: "Enter full name",
    username: "Username",
    enter_username: "Enter username",
    password: "Password",
    enter_password: "Enter password",
    select_role: "Select role",
    manager: "Manager",
    cashier: "Cashier",
    adding: "Adding...",
    staff_added: "Staff Added",
    staff_updated: "Staff updated",
    status_updated: "Status Updated",
    saving: "Saving...",
    // AI
    ai_insights: "AI Insights",
    ai_recommendations_description:
      "Leverage AI to optimize your stock levels, identify promotional opportunities, and plan reorders.",
    // Messages
    settings_updated: "Settings Updated",
    settings_saved: "Application settings have been saved successfully.",
    failed_to_update: "Failed to update settings",
    access_denied: "Access Denied",
    super_admin_only: "Only Super Administrators can access settings.",
    no_data_found: "No data found",
    loading_data: "Loading data...",
    retry: "Retry",
    // Cashier Overview
    my_total_sales_value: "My Total Sales Value",
    all_sales_recorded: "All sales you've recorded.",
    my_total_orders: "My Total Orders",
    total_orders_processed: "Total orders you've processed.",
    my_average_sale_value: "My Average Sale Value",
    average_value_per_order: "Average value per order.",
    my_recent_sales: "My Recent Sales",
    recent_sales: "Recent Sales",
    view_all_sales: "View All Sales",
    order_id: "Order ID",
    amount: "Amount",
    payment_mode: "Payment Mode",
    date: "Date",
    status: "Status",
    completed: "Completed",
    no_recent_sales: "No recent sales",
    // Sales Page
    filter_by_cashier: "Filter by cashier",
    filter_by_date: "Filter by date",
    all_cashiers: "All Cashiers",
    all_time: "All Time",
    pick_date_range: "Pick a date range",
    clear_range: "Clear Range",
    total_revenue: "Total Revenue",
    total_sales_count: "Total Sales",
    items_count: "Items Count",
    record_new_sale: "Record New Sale",
    // Performance Chart
    target: "Target",
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
    total_orders: "Total Orders",
    day: "Day",
    days: "Days",
    month: "Month",
    months: "Months",
    jan: "Jan",
    feb: "Feb",
    mar: "Mar",
    apr: "Apr",
    may: "May",
    jun: "Jun",
    jul: "Jul",
    aug: "Aug",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Dec",
    image: "Image",
    price: "Price",
    date_updated: "Date Updated",
    page: "Page",
    rows_per_page: "Rows per page",
    of: "of",
    product: "Product",
    quantity: "Quantity",
    view_details: "View Details",
    sale_details: "Sale Details",
    complete_transaction_information: "Complete transaction information",
    sale_id: "Sale ID",
    payment_method: "Payment Method",
    items: "Items",
    subtotal: "Subtotal",
    vat: "VAT",
    total_amount: "Total Amount",
    update_stock_description: "Set the new stock quantity for this product.",
    update_staff_details: "Update staff details below.",
    application_name: "Application Name",
    logo_url: "Logo URL",
    vat_percentage: "VAT Percentage",
    primary_color: "Primary Color",
    secondary_color: "Secondary Color",
    accent_color: "Accent Color",
    theme: "Theme",
    date_format: "Date Format",
    time_format: "Time Format",
    maintenance_mode: "Maintenance Mode",
    general: "General",
    appearance: "Appearance",
    currency: "Currency",
    localization: "Localization",
    system: "System",
    all_payment_method: "All Payment Methods",
    disable_date_picker_tooltip: "Clear quick filter to use custom date range.",
  },
  fr: {
    // Common
    settings: "Paramètres",
    save: "Enregistrer",
    cancel: "Annuler",
    reset: "Réinitialiser",
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    confirm: "Confirmer",
    delete: "Supprimer",
    edit: "Modifier",
    view: "Voir",
    add: "Ajouter",
    remove: "Retirer",
    search: "Rechercher",
    filter: "Filtrer",
    sort: "Trier",
    refresh: "Rafraîchir",
    welcome: "Bienvenue",
    today: "Aujourd'hui",
    this_week: "Cette semaine",
    this_month: "Ce mois-ci",
    this_year: "Cette année",
    manager_overview_description:
      "Voici un aperçu des performances de votre magasin.",
    cashier_overview_description: "Voici un résumé de votre activité de vente.",
    // Breadcrumbs
    dashboard: "Tableau de bord",
    overview: "Aperçu",
    // Settings Descriptions
    general_settings_description:
      "Configurer les informations de base de l'application et la marque.",
    appearance_settings_description:
      "Personnaliser le schéma de couleurs et le thème de l'application.",
    currency_settings_description:
      "Configurer la devise par défaut pour les transactions et les prix.",
    localization_settings_description:
      "Configurer la langue, le fuseau horaire et les formats de date et d'heure.",
    system_settings_description:
      "Configurer les préférences au niveau du système et les options de maintenance.",
    maintenance_mode_description:
      "Activer le mode maintenance pour restreindre l'accès à l'application.",
    // Search Placeholders
    search_products: "Rechercher des produits...",
    search_staff:
      "Rechercher du personnel par nom, nom d'utilisateur ou rôle...",
    search_sales_cashier:
      "Rechercher des ventes par caissier, produit ou mode de paiement...",
    search_sales_product:
      "Rechercher des ventes par produit ou mode de paiement...",
    search_products_advanced:
      "Rechercher par ID, nom, catégorie, prix, GTIN ou description...",
    // Overview Components
    active_cashiers: "Caissiers actifs",
    low_stock_items: "Articles en stock faible",
    currently_active_staff: "Personnel actuellement actif",
    needs_attention: "Nécessite une attention",
    all_items_well_stocked: "Tous les articles bien approvisionnés",
    daily_sales_last_7_days: "Ventes quotidiennes (7 derniers jours)",
    revenue_generated_per_day: "Revenus générés par jour.",
    weekly_sales_comparison: "Comparaison des ventes hebdomadaires",
    this_week_vs_last_week: "Cette semaine vs. la semaine dernière.",
    monthly_sales_comparison: "Comparaison des ventes mensuelles",
    total_sales_per_month: "Ventes totales par mois.",
    last_week: "La semaine dernière",
    weekly: "Hebdomadaire",
    monthly: "Mensuel",
    monthly_last_6_months: "Mensuel (6 derniers mois)",
    // Sales
    sales: "Ventes",
    sales_history_description: "Afficher et filtrer les transactions de vente.",
    record_sale: "Enregistrer une nouvelle vente",
    record_sale_description:
      "Ajoutez des produits au panier et complétez la transaction.",
    // Inventaire
    products: "Produits",
    product_name: "Nom du produit",
    stock: "Stock",
    low_stock: "Stock faible",
    out_of_stock: "Rupture de stock",
    add_product: "Ajouter un produit",
    edit_product: "Modifier le produit",
    update_stock: "Mettre à jour le stock",
    inventory_management_description:
      "Afficher, ajouter et gérer votre stock de produits.",
    add_new_product: "Ajouter un nouveau produit",
    add_product_description:
      "Saisissez les détails du produit. L'URL de l'image et le GTIN sont facultatifs.",
    product_description: "Description du produit",
    product_category: "Catégorie de produit",
    new_quantity: "Quantité initiale",
    low_stock_margin: "Seuil de stock faible",
    image_url_optional: "URL de l'image (facultatif)",
    gtin_optional: "GTIN (facultatif)",
    inventory: "Inventaire",
    no_products_found: "Aucun produit trouvé.",
    // Personnel
    add_staff: "Ajouter du personnel",
    edit_staff: "Modifier le personnel",
    name: "Nom",
    email: "E-mail",
    role: "Rôle",
    active: "Actif",
    inactive: "Inactif",
    staff_management_description:
      "Voir les détails du personnel, les performances et gérer leur statut.",
    staff_management: "Gestion du personnel",
    no_staff_found: "Aucun personnel trouvé.",
    total_sales: "Ventes totales",
    number_of_orders: "# Commandes",
    actions: "Actions",
    add_new_staff_member: "Ajouter un nouveau membre du personnel",
    add_staff_description: "Ajoutez un nouveau membre du personnel au système.",
    full_name: "Nom complet",
    enter_full_name: "Entrez le nom complet",
    username: "Nom d'utilisateur",
    enter_username: "Entrez le nom d'utilisateur",
    password: "Mot de passe",
    enter_password: "Entrez le mot de passe",
    select_role: "Sélectionner le rôle",
    manager: "Gestionnaire",
    cashier: "Caissier",
    adding: "Ajout en cours...",
    staff_added: "Personnel ajouté",
    staff_updated: "Personnel mis à jour",
    status_updated: "Statut mis à jour",
    saving: "Enregistrement...",
    // IA
    ai_insights: "Insights AI",
    ai_recommendations_description:
      "Exploitez l'IA pour optimiser vos stocks, identifier les opportunités promotionnelles et planifier les réapprovisionnements.",
    // Messages
    settings_updated: "Paramètres mis à jour",
    settings_saved:
      "Les paramètres de l'application ont été enregistrés avec succès.",
    failed_to_update: "Échec de la mise à jour des paramètres",
    access_denied: "Accès refusé",
    super_admin_only:
      "Seuls les super administrateurs peuvent accéder aux paramètres.",
    no_data_found: "Aucune donnée trouvée",
    loading_data: "Chargement des données...",
    retry: "Réessayer",
    // Cashier Overview
    my_total_sales_value: "Ma valeur totale des ventes",
    all_sales_recorded: "Toutes les ventes que vous avez enregistrées.",
    my_total_orders: "Mes commandes totales",
    total_orders_processed: "Total des commandes que vous avez traitées.",
    my_average_sale_value: "Ma valeur moyenne de vente",
    average_value_per_order: "Valeur moyenne par commande.",
    my_recent_sales: "Mes ventes récentes",
    recent_sales: "Ventes récentes",
    view_all_sales: "Voir toutes les ventes",
    order_id: "ID de commande",
    amount: "Montant",
    payment_mode: "Mode de paiement",
    date: "Date",
    status: "Statut",
    completed: "Terminé",
    no_recent_sales: "Aucune vente récente",
    // Sales Page
    filter_by_cashier: "Filtrer par caissier",
    filter_by_date: "Filtrer par date",
    all_cashiers: "Tous les caissiers",
    all_time: "Toute la période",
    pick_date_range: "Choisir une plage de dates",
    clear_range: "Effacer la plage",
    total_revenue: "Revenus totaux",
    total_sales_count: "Ventes totales",
    items_count: "Nombre d'articles",
    record_new_sale: "Enregistrer une nouvelle vente",
    // Performance Chart
    target: "Objectif",
    mon: "Lun",
    tue: "Mar",
    wed: "Mer",
    thu: "Jeu",
    fri: "Ven",
    sat: "Sam",
    sun: "Dim",
    total_orders: "Commandes totales",
    day: "Jour",
    days: "Jours",
    month: "Mois",
    months: "Mois",
    jan: "Janv",
    feb: "Févr",
    mar: "Mars",
    apr: "Avr",
    may: "Mai",
    jun: "Juin",
    jul: "Juil",
    aug: "Août",
    sep: "Sept",
    oct: "Oct",
    nov: "Nov",
    dec: "Déc",
    image: "Image",
    price: "Prix",
    date_updated: "Date mise à jour",
    page: "Page",
    rows_per_page: "Lignes par page",
    of: "de",
    product: "Produit",
    quantity: "Quantité",
    view_details: "Voir les détails",
    sale_details: "Détails de la vente",
    complete_transaction_information:
      "Informations complètes sur la transaction",
    sale_id: "ID de vente",
    payment_method: "Mode de paiement",
    items: "Articles",
    subtotal: "Sous-total",
    vat: "TVA",
    total_amount: "Montant total",
    update_stock_description:
      "Définissez la nouvelle quantité de stock pour ce produit.",
    update_staff_details:
      "Mettez à jour les informations du personnel ci-dessous.",
    application_name: "Nom de l'application",
    logo_url: "URL du logo",
    vat_percentage: "Pourcentage de TVA",
    primary_color: "Couleur principale",
    secondary_color: "Couleur secondaire",
    accent_color: "Couleur d'accentuation",
    theme: "Thème",
    date_format: "Format de date",
    time_format: "Format de l'heure",
    maintenance_mode: "Mode maintenance",
    general: "Général",
    appearance: "Apparence",
    currency: "Devise",
    localization: "Localisation",
    system: "Système",
    all_payment_method: "Tous les modes de paiement",
    disable_date_picker_tooltip:
      "Effacer le filtre rapide pour utiliser une date personnalisée.",
  },
  es: {
    // Common
    settings: "Configuración",
    save: "Guardar",
    cancel: "Cancelar",
    reset: "Restablecer",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    confirm: "Confirmar",
    delete: "Eliminar",
    edit: "Editar",
    view: "Ver",
    add: "Agregar",
    remove: "Eliminar",
    search: "Buscar",
    filter: "Filtrar",
    sort: "Ordenar",
    refresh: "Actualizar",
    welcome: "Bienvenido",
    today: "Hoy",
    this_week: "Esta semana",
    this_month: "Este mes",
    this_year: "Este año",
    manager_overview_description:
      "Aquí hay una visión general del rendimiento de su tienda.",
    cashier_overview_description:
      "Aquí hay un resumen de su actividad de ventas.",
    // Breadcrumbs
    dashboard: "Panel de control",
    overview: "Resumen",
    // Settings Descriptions
    general_settings_description:
      "Configurar información básica de la aplicación y la marca.",
    appearance_settings_description:
      "Personalizar el esquema de colores y el tema de la aplicación.",
    currency_settings_description:
      "Configurar la moneda por defecto para las transacciones y los precios.",
    localization_settings_description:
      "Configurar el idioma, el fuso horario y los formatos de fecha y hora.",
    system_settings_description:
      "Configurar las preferencias de nivel de sistema y las opciones de mantenimiento.",
    maintenance_mode_description:
      "Activar el modo de mantenimiento para restringir el acceso a la aplicación.",
    // Search Placeholders
    search_products: "Buscar productos...",
    search_staff: "Buscar personal por nombre, usuario o rol...",
    search_sales_cashier:
      "Buscar ventas por cajero, producto o modo de pago...",
    search_sales_product: "Buscar ventas por producto o modo de pago...",
    search_products_advanced:
      "Buscar por ID, nombre, categoría, precio, GTIN o descripción...",
    // Overview Components
    active_cashiers: "Cajeros activos",
    low_stock_items: "Artículos con stock bajo",
    currently_active_staff: "Personal actualmente activo",
    needs_attention: "Necesita atención",
    all_items_well_stocked: "Todos los artículos bien abastecidos",
    daily_sales_last_7_days: "Ventas diarias (últimos 7 días)",
    revenue_generated_per_day: "Ingresos generados por día.",
    weekly_sales_comparison: "Comparación de ventas semanales",
    this_week_vs_last_week: "Esta semana vs. la semana pasada.",
    monthly_sales_comparison: "Comparación de ventas mensuales",
    total_sales_per_month: "Ventas totales por mes.",
    last_week: "La semana pasada",
    weekly: "Semanal",
    monthly: "Mensual",
    monthly_last_6_months: "Mensual (últimos 6 meses)",
    // Sales
    sales: "Ventas",
    sales_history_description: "Ver y filtrar transacciones de venta.",
    record_sale: "Registrar nueva venta",
    record_sale_description:
      "Agregue productos al carrito y complete la transacción.",
    // Inventario
    products: "Productos",
    product_name: "Nombre del producto",
    stock: "Stock",
    low_stock: "Stock bajo",
    out_of_stock: "Agotado",
    add_product: "Agregar producto",
    edit_product: "Editar producto",
    update_stock: "Actualizar stock",
    inventory_management_description:
      "Ver, agregar y administrar su stock de productos.",
    add_new_product: "Agregar nuevo producto",
    add_product_description:
      "Ingrese los detalles del producto. La URL de la imagen y el GTIN son opcionales.",
    product_description: "Descripción del producto",
    product_category: "Categoría del producto",
    new_quantity: "Cantidad inicial",
    low_stock_margin: "Umbral de stock bajo",
    image_url_optional: "URL de la imagen (opcional)",
    gtin_optional: "GTIN (opcional)",
    inventory: "Inventario",
    no_products_found: "No se encontraron productos.",
    // Personal
    add_staff: "Agregar personal",
    edit_staff: "Editar personal",
    name: "Nombre",
    email: "Correo electrónico",
    role: "Rol",
    active: "Activo",
    inactive: "Inactivo",
    staff_management_description:
      "Ver detalles del personal, rendimiento y gestionar su estado.",
    staff_management: "Gestión de personal",
    no_staff_found: "No se encontró personal.",
    total_sales: "Ventas totales",
    number_of_orders: "# Pedidos",
    actions: "Acciones",
    add_new_staff_member: "Agregar nuevo miembro del personal",
    add_staff_description: "Agregue un nuevo miembro del personal al sistema.",
    full_name: "Nombre completo",
    enter_full_name: "Ingrese el nombre completo",
    username: "Nombre de usuario",
    enter_username: "Ingrese el nombre de usuario",
    password: "Contraseña",
    enter_password: "Ingrese la contraseña",
    select_role: "Seleccionar rol",
    manager: "Gerente",
    cashier: "Cajero",
    adding: "Agregando...",
    staff_added: "Personal agregado",
    staff_updated: "Personal actualizado",
    status_updated: "Estado actualizado",
    saving: "Guardando...",
    // IA
    ai_insights: "Insights AI",
    ai_recommendations_description:
      "Aproveche la IA para optimizar sus niveles de stock, identificar oportunidades promocionales y planificar reabastecimientos.",
    // Mensajes
    settings_updated: "Configuración actualizada",
    settings_saved:
      "La configuración de la aplicación se ha guardado correctamente.",
    failed_to_update: "No se pudo actualizar la configuración",
    access_denied: "Acceso denegado",
    super_admin_only:
      "Solo los superadministradores pueden acceder a la configuración.",
    no_data_found: "No se encontraron datos",
    loading_data: "Cargando datos...",
    retry: "Reintentar",
    // Cashier Overview
    my_total_sales_value: "Mi valor total de ventas",
    all_sales_recorded: "Todas las ventas que has registrado.",
    my_total_orders: "Mis pedidos totales",
    total_orders_processed: "Total de pedidos que has procesado.",
    my_average_sale_value: "Mi valor promedio de venta",
    average_value_per_order: "Valor promedio por pedido.",
    my_recent_sales: "Mis ventas recientes",
    recent_sales: "Ventas recientes",
    view_all_sales: "Ver todas las ventas",
    order_id: "ID del pedido",
    amount: "Cantidad",
    payment_mode: "Modo de pago",
    date: "Fecha",
    status: "Estado",
    completed: "Completado",
    no_recent_sales: "No hay ventas recientes",
    // Sales Page
    filter_by_cashier: "Filtrar por cajero",
    filter_by_date: "Filtrar por fecha",
    all_cashiers: "Todos los cajeros",
    all_time: "Todo el tiempo",
    pick_date_range: "Elegir rango de fechas",
    clear_range: "Limpiar rango",
    total_revenue: "Ingresos totales",
    total_sales_count: "Ventas totales",
    items_count: "Cantidad de artículos",
    record_new_sale: "Registrar nueva venta",
    // Performance Chart
    target: "Objetivo",
    mon: "Lun",
    tue: "Mar",
    wed: "Mié",
    thu: "Jue",
    fri: "Vie",
    sat: "Sáb",
    sun: "Dom",
    total_orders: "Pedidos totales",
    day: "Día",
    days: "Días",
    month: "Mes",
    months: "Meses",
    jan: "Ene",
    feb: "Feb",
    mar: "Mar",
    apr: "Abr",
    may: "May",
    jun: "Jun",
    jul: "Jul",
    aug: "Ago",
    sep: "Sep",
    oct: "Oct",
    nov: "Nov",
    dec: "Dic",
    image: "Imagen",
    price: "Precio",
    date_updated: "Fecha de actualización",
    page: "Página",
    rows_per_page: "Filas por página",
    of: "de",
    product: "Producto",
    quantity: "Cantidad",
    view_details: "Ver detalles",
    sale_details: "Detalles de la venta",
    complete_transaction_information: "Información completa de la transacción",
    sale_id: "ID de venta",
    payment_method: "Método de pago",
    items: "Artículos",
    subtotal: "Subtotal",
    vat: "IVA",
    total_amount: "Monto total",
    update_stock_description:
      "Establezca la nueva cantidad de stock para este producto.",
    update_staff_details: "Actualice los detalles del personal a continuación.",
    application_name: "Nombre de la aplicación",
    logo_url: "URL del logo",
    vat_percentage: "Porcentaje de IVA",
    primary_color: "Color principal",
    secondary_color: "Color secundario",
    accent_color: "Color de acento",
    theme: "Tema",
    date_format: "Formato de fecha",
    time_format: "Formato de hora",
    maintenance_mode: "Modo de mantenimiento",
    general: "General",
    appearance: "Apariencia",
    currency: "Moneda",
    localization: "Localización",
    system: "Sistema",
    all_payment_method: "Todos los métodos de pago",
    disable_date_picker_tooltip:
      "Limpiar filtro rápido para usar rango de fecha personalizado.",
  },
  de: {
    // Common
    settings: "Einstellungen",
    save: "Speichern",
    cancel: "Abbrechen",
    reset: "Zurücksetzen",
    loading: "Lädt...",
    error: "Fehler",
    success: "Erfolg",
    confirm: "Bestätigen",
    delete: "Löschen",
    edit: "Bearbeiten",
    view: "Anzeigen",
    add: "Hinzufügen",
    remove: "Entfernen",
    search: "Suchen",
    filter: "Filtern",
    sort: "Sortieren",
    refresh: "Aktualisieren",
    welcome: "Willkommen",
    today: "Heute",
    this_week: "Diese Woche",
    this_month: "Dieser Monat",
    this_year: "Dieses Jahr",
    manager_overview_description:
      "Hier ist eine Übersicht über die Leistung Ihres Geschäfts.",
    cashier_overview_description:
      "Hier ist eine Zusammenfassung Ihrer Verkaufsaktivität.",
    // Breadcrumbs
    dashboard: "Dashboard",
    overview: "Übersicht",
    // Settings Descriptions
    general_settings_description:
      "Konfigurieren Sie grundlegende Anwendungsinformationen und Branding.",
    appearance_settings_description:
      "Passen Sie das Farbschema und das Theme der Anwendung an.",
    currency_settings_description:
      "Konfigurieren Sie die Standardwährung für Transaktionen und Preise.",
    localization_settings_description:
      "Konfigurieren Sie Sprache, Zeitzone und Datums-/Zeitformate.",
    system_settings_description:
      "Konfigurieren Sie systemweite Einstellungen und Wartungsoptionen.",
    maintenance_mode_description:
      "Aktivieren Sie den Wartungsmodus, um den Zugriff auf die Anwendung zu beschränken.",
    // Search Placeholders
    search_products: "Produkte suchen...",
    search_staff: "Personal nach Name, Benutzername oder Rolle suchen...",
    search_sales_cashier:
      "Verkäufe nach Kassierer, Produkt oder Zahlungsart suchen...",
    search_sales_product: "Verkäufe nach Produkt oder Zahlungsart suchen...",
    search_products_advanced:
      "Nach ID, Name, Kategorie, Preis, GTIN oder Beschreibung suchen...",
    // Overview Components
    active_cashiers: "Aktive Kassierer",
    low_stock_items: "Artikel mit niedrigem Bestand",
    currently_active_staff: "Derzeit aktives Personal",
    needs_attention: "Benötigt Aufmerksamkeit",
    all_items_well_stocked: "Alle Artikel gut bestückt",
    daily_sales_last_7_days: "Tägliche Verkäufe (letzte 7 Tage)",
    revenue_generated_per_day: "Täglich generierte Einnahmen.",
    weekly_sales_comparison: "Wöchentlicher Verkaufsvergleich",
    this_week_vs_last_week: "Diese Woche vs. letzte Woche.",
    monthly_sales_comparison: "Monatlicher Verkaufsvergleich",
    total_sales_per_month: "Gesamtverkäufe pro Monat.",
    last_week: "Letzte Woche",
    weekly: "Wöchentlich",
    monthly: "Monatlich",
    monthly_last_6_months: "Monatlich (letzte 6 Monate)",
    // Sales
    sales: "Verkäufe",
    sales_history_description: "Verkaufstransaktionen anzeigen und filtern.",
    record_sale: "Neuen Verkauf aufzeichnen",
    record_sale_description:
      "Fügen Sie Produkte zum Warenkorb hinzu und schließen Sie die Transaktion ab.",
    // Inventar
    products: "Produkte",
    product_name: "Produktname",
    stock: "Bestand",
    low_stock: "Niedriger Bestand",
    out_of_stock: "Nicht vorrätig",
    add_product: "Produkt hinzufügen",
    edit_product: "Produkt bearbeiten",
    update_stock: "Bestand aktualisieren",
    inventory_management_description:
      "Anzeigen, Hinzufügen und Verwalten Ihres Produktbestands.",
    add_new_product: "Neues Produkt hinzufügen",
    add_product_description:
      "Geben Sie die Produktdetails ein. Bild-URL und GTIN sind optional.",
    product_description: "Produktbeschreibung",
    product_category: "Produktkategorie",
    new_quantity: "Anfangsmenge",
    low_stock_margin: "Schwellenwert für niedrigen Bestand",
    image_url_optional: "Bild-URL (optional)",
    gtin_optional: "GTIN (optional)",
    inventory: "Inventar",
    no_products_found: "Keine Produkte gefunden.",
    // Personal
    add_staff: "Personal hinzufügen",
    edit_staff: "Personal bearbeiten",
    name: "Name",
    email: "E-Mail",
    role: "Rolle",
    active: "Aktiv",
    inactive: "Inaktiv",
    staff_management_description:
      "Personaldetails, Leistung anzeigen und Status verwalten.",
    staff_management: "Personalverwaltung",
    no_staff_found: "Kein Personal gefunden.",
    total_sales: "Gesamtverkäufe",
    number_of_orders: "# Bestellungen",
    actions: "Aktionen",
    add_new_staff_member: "Neues Personalmitglied hinzufügen",
    add_staff_description:
      "Fügen Sie ein neues Personalmitglied zum System hinzu.",
    full_name: "Vollständiger Name",
    enter_full_name: "Vollständigen Namen eingeben",
    username: "Benutzername",
    enter_username: "Benutzernamen eingeben",
    password: "Passwort",
    enter_password: "Passwort eingeben",
    select_role: "Rolle auswählen",
    manager: "Manager",
    cashier: "Kassierer",
    adding: "Hinzufügen...",
    staff_added: "Personal hinzugefügt",
    staff_updated: "Personal aktualisiert",
    status_updated: "Status aktualisiert",
    saving: "Speichern...",
    // KI
    ai_insights: "Insights AI",
    ai_recommendations_description:
      "Nutzen Sie KI, um Ihre Lagerbestände zu optimieren, Werbemöglichkeiten zu erkennen und Nachbestellungen zu planen.",
    // Nachrichten
    settings_updated: "Einstellungen aktualisiert",
    settings_saved:
      "Die Anwendungseinstellungen wurden erfolgreich gespeichert.",
    failed_to_update: "Einstellungen konnten nicht aktualisiert werden",
    access_denied: "Zugriff verweigert",
    super_admin_only:
      "Nur Superadministratoren können auf die Einstellungen zugreifen.",
    no_data_found: "Keine Daten gefunden",
    loading_data: "Daten werden geladen...",
    retry: "Erneut versuchen",
    // Cashier Overview
    my_total_sales_value: "Mein Gesamtverkaufswert",
    all_sales_recorded: "Alle Verkäufe, die Sie aufgezeichnet haben.",
    my_total_orders: "Meine Gesamtbestellungen",
    total_orders_processed: "Gesamtbestellungen, die Sie bearbeitet haben.",
    my_average_sale_value: "Mein durchschnittlicher Verkaufswert",
    average_value_per_order: "Durchschnittlicher Wert pro Bestellung.",
    my_recent_sales: "Meine letzten Verkäufe",
    recent_sales: "Letzte Verkäufe",
    view_all_sales: "Alle Verkäufe anzeigen",
    order_id: "Bestell-ID",
    amount: "Betrag",
    payment_mode: "Zahlungsart",
    date: "Datum",
    status: "Status",
    completed: "Abgeschlossen",
    no_recent_sales: "Keine letzten Verkäufe",
    // Sales Page
    filter_by_cashier: "Nach Kassierer filtern",
    filter_by_date: "Nach Datum filtern",
    all_cashiers: "Alle Kassierer",
    all_time: "Alle Zeit",
    pick_date_range: "Datumsbereich wählen",
    clear_range: "Bereich löschen",
    total_revenue: "Gesamteinnahmen",
    total_sales_count: "Gesamtverkäufe",
    items_count: "Anzahl der Artikel",
    record_new_sale: "Neuen Verkauf aufzeichnen",
    // Performance Chart
    target: "Ziel",
    mon: "Mo",
    tue: "Di",
    wed: "Mi",
    thu: "Do",
    fri: "Fr",
    sat: "Sa",
    sun: "So",
    total_orders: "Gesamtbestellungen",
    day: "Tag",
    days: "Tage",
    month: "Monat",
    months: "Monate",
    jan: "Jan",
    feb: "Feb",
    mar: "Mär",
    apr: "Apr",
    may: "Mai",
    jun: "Jun",
    jul: "Jul",
    aug: "Aug",
    sep: "Sep",
    oct: "Okt",
    nov: "Nov",
    dec: "Dez",
    image: "Bild",
    price: "Preis",
    date_updated: "Aktualisierungsdatum",
    page: "Seite",
    rows_per_page: "Zeilen pro Seite",
    of: "von",
    product: "Produkt",
    quantity: "Menge",
    view_details: "Details anzeigen",
    sale_details: "Verkaufsdetails",
    complete_transaction_information: "Vollständige Transaktionsinformationen",
    sale_id: "Verkaufs-ID",
    payment_method: "Zahlungsmethode",
    items: "Artikel",
    subtotal: "Zwischensumme",
    vat: "MwSt",
    total_amount: "Gesamtbetrag",
    update_stock_description:
      "Legen Sie die neue Lagerbestandsmenge für dieses Produkt fest.",
    update_staff_details: "Aktualisieren Sie unten die Personaldaten.",
    application_name: "Anwendungsname",
    logo_url: "Logo-URL",
    vat_percentage: "MwSt-Prozentsatz",
    primary_color: "Primärfarbe",
    secondary_color: "Sekundärfarbe",
    accent_color: "Akzentfarbe",
    theme: "Thema",
    date_format: "Datumsformat",
    time_format: "Zeitformat",
    maintenance_mode: "Wartungsmodus",
    general: "Allgemein",
    appearance: "Erscheinungsbild",
    currency: "Währung",
    localization: "Lokalisierung",
    system: "System",
    all_payment_method: "Alle Zahlungsmethoden",
    disable_date_picker_tooltip:
      "Bereich löschen, um benutzerdefinierte Datumsbereich zu verwenden.",
  },
};

/**
 * Get translation for a key in the current language
 */
export function getTranslation(key: string, language?: string): string {
  const currentLanguage = language || DEFAULT_SETTINGS.language;
  const languageTranslations =
    translations[currentLanguage] || translations[DEFAULT_SETTINGS.language];
  return languageTranslations[key] || key;
}

/**
 * Hook to get translation function for current language
 */
export function useTranslation() {
  try {
    const { settings } = useSettingsContext();
    const currentLanguage = settings?.language || DEFAULT_SETTINGS.language;

    return (key: string) => getTranslation(key, currentLanguage);
  } catch {
    // If context is not available, return default translation function
    return (key: string) => getTranslation(key);
  }
}

/**
 * Format date according to settings
 */
export function formatDate(
  date: Date,
  dateFormat?: string,
  language?: string
): string {
  const format = dateFormat || DEFAULT_SETTINGS.dateFormat;
  const lang = language || DEFAULT_SETTINGS.language;

  // Simple date formatting based on format string
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();

  switch (format) {
    case "dd/MM/yyyy":
      return `${day}/${month}/${year}`;
    case "MM/dd/yyyy":
      return `${month}/${day}/${year}`;
    case "yyyy-MM-dd":
      return `${year}-${month}-${day}`;
    case "dd-MM-yyyy":
      return `${day}-${month}-${year}`;
    case "MM-dd-yyyy":
      return `${month}-${day}-${year}`;
    default:
      return date.toLocaleDateString(lang);
  }
}

/**
 * Format time according to settings
 */
export function formatTime(date: Date, timeFormat?: string): string {
  const format = timeFormat || DEFAULT_SETTINGS.timeFormat;

  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  switch (format) {
    case "HH:mm":
      return `${hours.toString().padStart(2, "0")}:${minutes}`;
    case "hh:mm a":
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes} ${period}`;
    default:
      return date.toLocaleTimeString();
  }
}

/**
 * Hook to get date/time formatting functions
 */
export function useDateTimeFormat() {
  try {
    const { settings } = useSettingsContext();

    return {
      formatDate: (date: Date) =>
        formatDate(date, settings?.dateFormat, settings?.language),
      formatTime: (date: Date) => formatTime(date, settings?.timeFormat),
    };
  } catch {
    // If context is not available, return default formatting functions
    return {
      formatDate: (date: Date) => formatDate(date),
      formatTime: (date: Date) => formatTime(date),
    };
  }
}
