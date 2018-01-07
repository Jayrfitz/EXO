import flask_sqlalchemy, app, os, datetime

app.app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')

db = flask_sqlalchemy.SQLAlchemy(app.app)

class Policy(db.Model):
    id = db.Column(db.Integer, primary_key=True) # key
    policy_color = db.Column(db.String(20))
    desc = db.Column(db.Text)
    
    def __init__(self, n, p, d):
        self.policy_color = p
        self.desc = d
    def __repr__(self): 
        return '<Hunt Data: {} {} {}>'.format(
            self.id,
            self.policy_color,
            self.desc)
            
    
class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True) # key
    f_name = db.Column(db.String(32))
    l_name = db.Column(db.String(32))
    email = db.Column(db.String(512))
    is_super = db.Column(db.Boolean, nullable=False, default=False)
    password = db.Column(db.String(129))
    has_paid = db.Column(db.Boolean, nullable=False, default=False)
    
    def __init__(self, fn, ln, e, iss, p, hp):
        self.f_name = fn
        self.l_name = ln
        self.email = e
        self.is_super = iss
        self.password = p
        self.has_paid = hp
        
    def __repr__(self): 
        return '<Leader Data:{} {} {} {} {} {} {}>'.format(
            self.id,
            self.f_name,
            self.l_name,
            self.email,
            self.is_super,
            self.password,
            self.has_paid)
        
        
        
        
class License(db.Model):
    id = db.Column(db.Integer, primary_key=True) # key
    devices = db.Column(db.Integer)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    num_members = db.Column(db.Integer)
    leader_id = db.Column(db.Integer, db.ForeignKey('leader.id'), nullable=False)
    member_id = db.Column(db.Integer, db.ForeignKey('member.id'), nullable=True)
    
    def __init__(self, d, st, et, nm, lid, mid):
        self.devices = d
        self.start_time = st
        self.end_time = et
        self.num_members = nm
        self.leader_id = lid
        self.member_id = mid
        
    def __repr__(self): 
        return '<Hunt Data: {} {} {} {} {} {} {}>'.format(
            self.id,
            self.devices,
            self.start_time,
            self.end_time,
            self.num_members,
            self.leader_id,
            self.member_id)
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
class Admins(db.Model):
    id = db.Column(db.Integer, primary_key=True) # key
    email = db.Column(db.String(512))
    username = db.Column(db.String(32))
    password = db.Column(db.String(129))
    is_super = db.Column(db.Boolean, nullable=False, default=False)
    
    def __init__(self, e, u, p, iss):
        self.email = e
        self.username = u
        self.password = p
        self.is_super = iss
    
    def __repr__(self): 
        return '<Admin Data: {} {} {} {}>'.format(self.email, self.username, self.password, self.is_super)
        
class Discounts(db.Model):
    id = db.Column(db.Integer, primary_key=True) # key
    code = db.Column(db.String(129))
    percent = db.Column(db.Integer)
    uses = db.Column(db.Integer)
    
    def __init__(self, c, p, u):
        self.code = c
        self.percent = p
        self.uses = u
    
    def __repr__(self): 
        return '<Discount Data: {} {} {}>'.format(self.code, self.percent, self.uses)
