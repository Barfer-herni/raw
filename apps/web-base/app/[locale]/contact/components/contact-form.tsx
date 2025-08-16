'use client';

import type { Dictionary } from '@repo/internationalization';
import { Check, FileSpreadsheet, Mail } from 'lucide-react';
import { useState, FormEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { emailJSService } from '@/lib/emailjs-service';

type ContactFormProps = {
  dictionary: Dictionary;
};

interface FormData {
  nombre: string;
  email: string;
  mensaje: string;
}

interface StatusMessage {
  type: 'success' | 'error' | '';
  message: string;
}

export const ContactForm = ({ dictionary }: ContactFormProps) => {
  console.log('📝 ContactForm montándose...');
  
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    mensaje: ''
  });
  const [status, setStatus] = useState<StatusMessage>({
    type: '',
    message: ''
  });
  const [sending, setSending] = useState(false);
  
  console.log('📝 Estados inicializados:', { formData, status, sending });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    console.log('🚀 SUBMIT INICIADO - handleSubmit ejecutándose...');
    e.preventDefault();
    console.log('🚀 preventDefault() ejecutado');
    setSending(true);
    console.log('🚀 setSending(true) ejecutado');

    try {
      console.log('🚀 Iniciando EmailJS con datos:', {
        from_name: formData.nombre,
        from_email: formData.email,
        message: formData.mensaje.substring(0, 50) + '...'
      });
      
      // Usar EmailJS para enviar el email
      const result = await emailJSService.sendContactEmail({
        from_name: formData.nombre,
        from_email: formData.email,
        message: formData.mensaje,
      });
      
      console.log('🚀 Resultado de EmailJS:', result);
      
      if (result.error) {
        setStatus({
          type: 'error',
          message: result.error
        });
      } else {
        setStatus({
          type: 'success',
          message: dictionary.web.contact.form.success_message || '¡Mensaje enviado exitosamente!'
        });
        setFormData({
          nombre: '',
          email: '',
          mensaje: ''
        });
      }
      setSending(false);
    } catch (error) {
      setStatus({
        type: 'error',
        message: dictionary.web.contact.form.error_message || 'Error al enviar el mensaje. Intenta de nuevo.'
      });
      setSending(false);
    }
  };

  return (
    <div className="w-full py-20 lg:py-40 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <h4 className="max-w-xl text-left font-black text-3xl tracking-tighter md:text-5xl var(--font-nunito) text-foreground">
                  {dictionary.web.contact.meta.title}
                </h4>
                <p className="max-w-sm text-left text-lg text-muted-foreground leading-relaxed tracking-tight var(--font-nunito)">
                  {dictionary.web.contact.meta.description}
                </p>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 shadow-md">
              {[
                ...dictionary.web.contact.hero.benefits.slice(0, 3)
              ].map((benefit, index) => (
                <div
                  className="flex flex-row items-start gap-4 py-3 border-b border-border last:border-0"
                  key={index}
                >
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="var(--font-nunito) font-bold text-foreground">{benefit.title}</p>
                    <p className="text-muted-foreground text-sm var(--font-nunito)">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-6 mt-4">
              <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center shadow-md">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black var(--font-nunito) text-foreground">LupaPyme</h3>
                <p className="text-sm text-muted-foreground var(--font-nunito)">{dictionary.web.contact.form.subtitleInfo}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <motion.div
              variants={{
                initial: { opacity: 0, y: 20 },
                animate: { opacity: 1, y: 0 },
              }}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="w-full max-w-md bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border hover:border-border/80 transition-colors"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{dictionary.web.contact.form.title}</h3>
                  <p className="text-muted-foreground text-sm">{dictionary.web.contact.form.subtitle}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder={dictionary.web.contact.form.name_placeholder}
                    required
                    className="w-full px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground/60 rounded-xl border border-border focus:border-primary/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={dictionary.web.contact.form.email_placeholder}
                    required
                    className="w-full px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground/60 rounded-xl border border-border focus:border-primary/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    placeholder={dictionary.web.contact.form.message_placeholder}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-background text-foreground placeholder:text-muted-foreground/60 rounded-xl border border-border focus:border-primary/50 focus:outline-none transition-colors resize-none"
                  ></textarea>
                </div>

                {status.type && (
                  <div
                    className={`p-4 rounded-xl ${status.type === "success"
                      ? "bg-green-500/10"
                      : "bg-red-500/10"
                      }`}
                  >
                    <p
                      className={`text-sm ${status.type === "success"
                        ? "text-green-400"
                        : "text-red-400"
                        }`}
                    >
                      {status.message}
                    </p>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={sending}
                  className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  onClick={(e) => {
                    console.log('🎯 BOTÓN CLICKEADO - React funcionando!');
                    // No hacer preventDefault aquí, dejar que el onSubmit del form lo maneje
                  }}
                >
                  {sending ? (dictionary.web.contact.form.sending || 'Enviando...') : (dictionary.web.contact.form.send_button || 'Enviar')}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
