from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField
from wtforms.validators import DataRequired, Length, Regexp

class LoginForm(FlaskForm):

    usuario = StringField('Usuario', validators=[
        DataRequired(message='El nombre de usuario es requerido'),
        Length(min=4, max=20, message='El usuario debe tener entre 4 y 20 caracteres'),
        Regexp('^[A-Za-z0-9_.@]+$', 
               message='El usuario solo puede contener letras, números, guiones bajos y arrobas')
    ])
    
    contrasenia = PasswordField('Contraseña', validators=[
        DataRequired(message='La contraseña es requerida'),
        Length(min=6, message='La contraseña debe tener al menos  caracteres')
        # Regexp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+', 
        #        message='La contraseña debe contener al menos una mayúscula, una minúscula y un número')
    ])
    
    remember_me = BooleanField('Recuérdame')