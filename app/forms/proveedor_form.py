import email
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TelField, TextAreaField, EmailField
from wtforms.validators import DataRequired, Email

class ProveedorForm(FlaskForm):
    nombre = StringField('Nombre', validators=[DataRequired()])
    telefono = TelField('Teléfono',)
    contacto = StringField('Persona de Contacto')
    correo = EmailField('Correo', validators=[Email()])
    descripcion = TextAreaField('Descripción del Servicio')
    submit = SubmitField('Guardar')