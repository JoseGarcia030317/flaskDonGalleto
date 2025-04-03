from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, TelField, EmailField,PasswordField
from wtforms.validators import DataRequired, Email,Length,Regexp


class ClienteForm(FlaskForm):
    nombre = StringField('Nombre', validators=[
        Length(min=4, max=65),
        Regexp('^[A-Za]', 
        message='El usuario solo puede contener letras')])
    ape_paterno = StringField('Apellido Paterno',validators=[
        Length(min=4, max=65),
        Regexp('^[A-Za]', 
         message='El usuario solo puede contener letras')])  
    ape_materno = StringField('Apellido Materno',validators=[
        Length(min=4, max=65),
        Regexp('^[A-Za]', 
        message='El usuario solo puede contener letras')])  
    telefono = TelField('Telefono', validators=[
        DataRequired(),
        Length(min=10, max=15, message='El teléfono debe tener exactamente 10 dígitos'),
        Regexp('^[0-9]*$', message='El teléfono solo debe contener números')
    ])
    empresa = StringField('Empresa') 
    tipo = StringField('Tipo de Cliente')
    correo = EmailField('Correo', validators=[DataRequired(), Email()])
    contrasenia = PasswordField('Contraseña', validators=[
        DataRequired(),
        Length(min=6, message='La contraseña debe tener al menos 6 caracteres')
    ])
    submit = SubmitField('Guardar')