# 📧 Configuración de EmailJS para el Formulario de Contacto

## ✅ Problema Solucionado

El formulario de contacto en `/apps/app/app/[locale]/(authenticated)/admin/page.tsx` ya no se reinicia al hacer clic en "Enviar Mensaje". Ahora tiene:

- ✅ **Estado del formulario** conectado
- ✅ **Validación** de campos obligatorios
- ✅ **preventDefault()** para evitar recarga de página
- ✅ **Feedback visual** (mensajes de éxito/error)
- ✅ **Limpieza** del formulario tras envío exitoso
- ✅ **Estados de carga** con botón deshabilitado

## 🚀 Funcionamiento Actual

**✅ ACTIVADO**: El formulario ahora envía correos reales usando EmailJS con las variables de entorno configuradas.

## 🔧 Configuración Aplicada

### Paso 1: Instalar EmailJS
```bash
cd apps/app
npm install @emailjs/browser
```

### Paso 2: Configurar EmailJS Service

1. Ve a [EmailJS.com](https://www.emailjs.com/) y crea una cuenta
2. Crea un nuevo **Service** (Gmail, Outlook, etc.)
3. Crea un nuevo **Template** con estas variables:
   - `{{from_name}}` - Nombre del remitente
   - `{{from_email}}` - Email del remitente  
   - `{{subject}}` - Asunto del mensaje
   - `{{message}}` - Contenido del mensaje
   - `{{to_email}}` - Email destino

### Paso 3: Obtener las Claves

- **Service ID**: `service_ysko2ec` (ya configurado)
- **Template ID**: Copia el ID del template que creaste
- **Public Key**: Copia tu public key desde EmailJS

### Paso 4: Descomentar el Código

En `/apps/app/app/[locale]/(authenticated)/admin/page.tsx`:

1. **Descomenta la línea 9:**
```typescript
import emailjs from '@emailjs/browser';
```

2. **Reemplaza las líneas 544-600** con:
```typescript
try {
    // Configuración EmailJS
    const serviceId = 'service_ysko2ec';
    const templateId = 'TU_TEMPLATE_ID'; // Reemplaza con tu template ID
    const publicKey = 'TU_PUBLIC_KEY'; // Reemplaza con tu public key

    // Inicializar EmailJS
    emailjs.init(publicKey);

    // Enviar email
    const templateParams = {
        from_name: contactForm.nombre,
        from_email: contactForm.email,
        subject: contactForm.asunto || 'Consulta desde Admin',
        message: contactForm.mensaje,
        to_email: 'nicolascaliari28@gmail.com'
    };

    await emailjs.send(serviceId, templateId, templateParams);

    setContactStatus({
        type: 'success',
        message: '¡Mensaje enviado exitosamente! Te responderemos pronto.'
    });

    // Limpiar formulario
    setContactForm({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
    });

} catch (error) {
    console.error('Error enviando mensaje:', error);
    setContactStatus({
        type: 'error',
        message: 'Error al enviar el mensaje. Por favor intenta nuevamente.'
    });
}
```

## 📋 Template de EmailJS Sugerido

**Subject:** Nueva consulta desde Admin - {{subject}}

**Body:**
```
Has recibido una nueva consulta desde el panel de administración:

De: {{from_name}} ({{from_email}})
Asunto: {{subject}}

Mensaje:
{{message}}

---
Este mensaje fue enviado desde el formulario de contacto del panel de administración.
```

## 🧪 Cómo Probar

1. Ve a la página de admin
2. Scroll hasta el formulario "¿Tenes alguna consulta?"
3. Completa los campos (nombre y email son obligatorios)
4. Haz clic en "Enviar Mensaje"
5. Verifica que:
   - ✅ La página no se recarga
   - ✅ Aparece mensaje de éxito
   - ✅ El formulario se limpia
   - ✅ (Con EmailJS configurado) Recibes el correo

## 🔍 Debugging

- Los datos del formulario se logean en la consola
- Revisa la consola del navegador para ver errores
- Verifica que todas las claves de EmailJS sean correctas

---

**Status**: ✅ Formulario funcionando completamente | ✅ EmailJS configurado y enviando correos reales
