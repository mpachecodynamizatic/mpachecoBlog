---
title: "Integrar Business Central con Power BI"
date: 2026-10-04
author: "Tu Nombre"
categories: ["Business Central", "Power BI"]
tags: ["bc", "pbi", "integration", "data"]
description: "Conecta Business Central con Power BI para análisis avanzados de datos."
---

# Integrar Business Central con Power BI

La integración entre Business Central y Power BI permite crear reportes y dashboards poderosos.

## Ventajas de la integración

- Acceso a datos en tiempo real
- Análisis detallado de datos BC
- Dashboards interactivos
- Automatización de reportes

## Métodos de conexión

### Opción 1: Conector nativo
Power BI tiene un conector específico para BC que facilita la conexión.

### Opción 2: API REST
Accede a datos mediante las APIs REST de BC.

```unknownlang
GET /api/v2.0/companies
Authorization: Bearer <token>
```

### Opción 3: Excel
Exporta datos a Excel para análisis.

| Método | Latencia | Complejidad |
|--------|----------|-------------|
| Conector nativo | Baja | Baja |
| API REST | Baja | Alta |
| Excel | Alta | Media |

## Pasos básicos

1. Crear conexión en Power BI Desktop
2. Seleccionar tablas de BC
3. Transformar datos si es necesario
4. Crear visualizaciones
5. Publicar dashboard

## Conclusión

La integración BC + PBI es fundamental para el análisis de datos empresariales.
