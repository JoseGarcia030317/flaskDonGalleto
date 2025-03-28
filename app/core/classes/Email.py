import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from flask import render_template

class EmailSender:
    def __init__(self, host, port, username, password, use_tls=True):
        """
        Inicializa la configuración del servidor SMTP.
        :param host: Dirección del servidor SMTP.
        :param port: Puerto del servidor SMTP.
        :param username: Usuario para autenticación.
        :param password: Contraseña para autenticación.
        :param use_tls: Booleano para indicar si se usará TLS.
        """
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.use_tls = use_tls
        self.server = None

    def connect(self):
        """
        Conecta y autentica en el servidor SMTP.
        """
        self.server = smtplib.SMTP(self.host, self.port)
        self.server.ehlo()
        if self.use_tls:
            self.server.starttls()
        self.server.login(self.username, self.password)

    def disconnect(self):
        """
        Cierra la conexión con el servidor SMTP.
        """
        if self.server:
            self.server.quit()

    def send_email(self, subject, sender, recipients, text_body, html_body=None):
        """
        Envía un correo electrónico a uno o varios destinatarios.
        :param subject: Asunto del correo.
        :param sender: Dirección del remitente.
        :param recipients: Lista de direcciones de correo destino.
        :param text_body: Cuerpo del mensaje en texto plano.
        :param html_body: (Opcional) Cuerpo del mensaje en HTML.
        """
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = sender
        msg['To'] = ", ".join(recipients)

        # Agrega la parte de texto
        part1 = MIMEText(text_body, 'plain')
        msg.attach(part1)
        
        # Si se provee, agrega la parte HTML
        if html_body:
            part2 = MIMEText(html_body, 'html')
            msg.attach(part2)
        
        self.server.sendmail(sender, recipients, msg.as_string())

    def send_mass_email(self, subject, sender, recipients_list, text_body, html_body=None):
        """
        Envía correos de forma masiva a grupos de destinatarios.
        :param subject: Asunto del correo.
        :param sender: Dirección del remitente.
        :param recipients_list: Lista de listas, donde cada sublista contiene direcciones de un grupo a quien enviar.
        :param text_body: Cuerpo del mensaje en texto plano.
        :param html_body: (Opcional) Cuerpo del mensaje en HTML.
        """
        for recipients in recipients_list:
            self.send_email(subject, sender, recipients, text_body, html_body)

    def send_template_email(self, subject, sender, recipients, template_name, context, plain_template=None):
        """
        Envía un correo electrónico renderizando un template de Jinja.
        Requiere que el código se ejecute dentro del contexto de una aplicación Flask.
        :param subject: Asunto del correo.
        :param sender: Dirección del remitente.
        :param recipients: Lista de direcciones de correo destino.
        :param template_name: Nombre del template HTML para renderizar.
        :param context: Diccionario con variables para el template.
        :param plain_template: (Opcional) Template para la versión en texto plano.
        """
        # Renderiza el contenido HTML usando el template de Jinja
        html_body = render_template(template_name, **context)
        
        # Si se provee, renderiza también el contenido en texto plano
        if plain_template:
            text_body = render_template(plain_template, **context)
        else:
            text_body = ''
            
        self.send_email(subject, sender, recipients, text_body, html_body)
