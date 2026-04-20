import json
import os
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_talisman import Talisman
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.secret_key = 'harsh_portfolio_key_2026'

# --- CONFIGURATION ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///portfolio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/img/'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'webp', 'gif'}

# Ensure upload folder exists
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

db = SQLAlchemy(app)

# --- LOGIN MANAGER ---
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'


# --- MODELS ---
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)


class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    desc = db.Column(db.Text, nullable=False)
    img = db.Column(db.String(100))
    link = db.Column(db.String(200))


class Experience(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.String(100), nullable=False)
    company = db.Column(db.String(100), nullable=False)
    year = db.Column(db.String(50), nullable=False)


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# --- HELPERS ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def load_portfolio_data():
    json_path = os.path.join(app.root_path, 'data.json')
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as file:
            return json.load(file)
    return {"projects": [], "experiences": [], "education": [], "skills": []}


def sync_to_json():
    current_json = load_portfolio_data()
    current_json["projects"] = [{"title": p.title, "desc": p.desc, "img": p.img, "link": p.link} for p in
                                Project.query.all()]
    current_json["experiences"] = [{"role": e.role, "company": e.company, "year": e.year} for e in
                                   Experience.query.all()]
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(current_json, f, indent=4)


# --- ROUTES ---

@app.route('/')
def home():
    data = load_portfolio_data()
    # SQL data priorities, fallback to JSON
    projects = Project.query.all() or data.get('projects', [])
    experiences = Experience.query.all() or data.get('experiences', [])
    return render_template('index.html', projects=projects, experiences=experiences,
                           education=data.get('education', []), skills=data.get('skills', []))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form.get('username')).first()
        if user and user.password == request.form.get('password'):
            login_user(user)
            return redirect(url_for('admin_dashboard'))
        flash('Invalid credentials')
    return render_template('login.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('home'))


@app.route('/admin')
@login_required
def admin_dashboard():
    projects = Project.query.all()
    experiences = Experience.query.all()
    return render_template('admin.html', projects=projects, experiences=experiences)


# --- ADMIN ACTIONS ---

@app.route('/admin/add-project', methods=['POST'])
@login_required
def add_project():
    title = request.form.get('title')
    desc = request.form.get('desc')
    link = request.form.get('link')

    file = request.files.get('file')
    filename = ""
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

    new_p = Project(title=title, desc=desc, img=filename, link=link)
    db.session.add(new_p)
    db.session.commit()
    sync_to_json()
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/add-exp', methods=['POST'])
@login_required
def add_exp():
    new_e = Experience(
        role=request.form.get('role'),
        company=request.form.get('company'),
        year=request.form.get('year')
    )
    db.session.add(new_e)
    db.session.commit()
    sync_to_json()
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/delete-project/<int:id>')
@login_required
def delete_project(id):
    p = Project.query.get(id)
    if p:
        db.session.delete(p)
        db.session.commit()
        sync_to_json()
    return redirect(url_for('admin_dashboard'))


@app.route('/admin/delete-exp/<int:id>')
@login_required
def delete_exp(id):
    e = Experience.query.get(id)
    if e:
        db.session.delete(e)
        db.session.commit()
        sync_to_json()
    return redirect(url_for('admin_dashboard'))


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(username='admin').first():
            admin_user = User(username='admin', password='password123')
            db.session.add(admin_user)
            db.session.commit()
    app.run(debug=True)