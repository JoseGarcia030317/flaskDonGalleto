from flask import Blueprint, render_template 


mod_landingpage_bp = Blueprint("mod_landingpage_bp", __name__)

# Pagina inicial del modulo de compras
@mod_landingpage_bp.route("/landingpage")
def landing_page():
    return render_template("/main-page/main-page-portal-inicio.html")
