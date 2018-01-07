import flask, flask_socketio, flask_sqlalchemy, stripe, sqlalchemy
import os, time, datetime, smtplib, re, random, hashlib, uuid, json
import models

#Global variables
x = 1
announceHour = 12 # in UTC, corresponds to 4AM PST
announceMinute = 0
announceTime = datetime.datetime.now().replace(hour=announceHour, minute=announceMinute)

#Application setup
app = flask.Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

socketio = flask_socketio.SocketIO(app)
db = flask_sqlalchemy.SQLAlchemy(app)

#Function definitions
@app.route('/')
def hello():
    return flask.render_template('index.html')

@socketio.on('home')
def updateHome(data):
    #checks for hunts that have ended on a day-long timer defined as announceHour and announceMinute above
    global announceTime
    if (datetime.datetime.now() - announceTime).total_seconds() > 0:
        setAnnounceTime()
    loggedIn = data['loggedIn'].lower()
    lastPage = data['lastPage']
    superAdminPages = ['admins', 'adminCreate']
    adminPages = ['adminHome', 'adminLeaderboard', 'adminHunts', 'adminCreateHunt', 'adminEditHunt']
    adminPages.extend(superAdminPages)
    teamPages = ['play']
    loginPages = [] 
    loginPages.extend(adminPages)
    loginPages.extend(teamPages)
    notLoggedIn = ('no' in loggedIn) and (lastPage in loginPages)
    notAdmin = (lastPage in adminPages) and ('admin' not in loggedIn)
    notSuperAdmin = ((lastPage in superAdminPages) and ('super' not in loggedIn))
    noTeam = (lastPage in teamPages) and ('team' not in loggedIn)
    resetConditions = notLoggedIn or notAdmin or notSuperAdmin or noTeam
    if resetConditions:
	    lastPage = 'home'
    return lastPage






@socketio.on('explore')
def updateExplore(data):
    socketio.emit('updateExplore')
    
@socketio.on('changeType')
def changeType(data):
    policies = []
    try:
        p = models.db.session.query(models.Policy).distinct()
        for row in p:
            policies.append({'id':row.id,'policy_color':row.policy_color,'desc':row.desc})
        return json.dumps({'policies':policies})
    except Exception as e: 
        print(e)
        
        
@socketio.on('validateCredentials')
def validateCredentials(data):
    try:  
        users = models.db.session.query(models.Participants).filter(models.Participants.team_name == data['team_name'])
        for query in users:
            if(checkPassword(query.leader_code, data['access'])):
                return json.dumps({'id':query.id, 'loggedIn':'teamLead', 'name':query.team_name, "hunts_id":query.hunts_id})
            elif(checkPassword(query.member_code, data['access'])):
                return json.dumps({'id':query.id, 'loggedIn':'team', 'name':query.team_name, "hunts_id":query.hunts_id})
                
        users = models.db.session.query(models.Admins).filter(models.Admins.username == data['team_name'], models.Admins.is_super == True)
        for query in users:    
            if(checkPassword(query.password, data['access'])):
                return json.dumps({'id':query.id, 'loggedIn':'superAdmin', 'name':query.username})
                
        users = models.db.session.query(models.Admins).filter(models.Admins.username == data['team_name'], models.Admins.is_super == False)
        for query in users:
            if(checkPassword(query.password, data['access'])):
                return json.dumps({'id':query.id, 'loggedIn':'admin', 'name':query.username})
        
        return json.dumps({'id':-1, 'loggedIn':'no', 'name':'guest'})
    except Exception as e: 
        print(e)

@socketio.on('adminHome')
def updatePlay(data):
    socketio.emit('updateAdminHome', 'updateAdmin');

@socketio.on('loadAdmin')
def getUser(data):
    adminData = []
    try:
        admins = models.db.session.query(models.Admins).filter(models.Admins.id == data)
        for query in admins:  
            adminData.append({'id':data, 'email': query.email, 'username':query.username, 'is_super':query.is_super})
        return json.dumps(adminData)
    except Exception as e: 
        print(e)
        
@socketio.on('loadHunts')
def getHunt(data):
    huntData = []
    questionsData = []
    try:
        hunt = models.db.session.query(models.Hunts).filter(models.Hunts.id == data)
        for row in hunt:
            huntData.append({'id':row.id, 'name': row.name, 'image':row.image, 'start_text':row.start_text})
    except Exception as e: 
        print(e)
    try:
        questions = models.db.session.query(models.Questions).filter(models.Questions.hunts_id == data)
        for row in questions:
            questionsData.append({'question':row.question, 'answer':row.answer,'hint1':row.hint_A,'hint2':row.hint_B,'hunts_id':row.hunts_id})
    except Exception as e: 
        print(e)
    return json.dumps({'hunt':huntData,'questions':questionsData})


@socketio.on('update')
def updateProgress(data):
    try:
        user = data['user']
        #updates the progress
        query = models.db.session.query(models.Participants).filter(models.Participants.email == user['email'], models.Participants.team_name == user['team_name'], models.Participants.hunts_id == user['hunts_id']).update({models.Participants.progress: data['progress']})
        models.db.session.commit()
        #updates the attempts  
        query = models.db.session.query(models.Participants).filter(models.Participants.email == user['email'], models.Participants.team_name == user['team_name'], models.Participants.hunts_id == user['hunts_id']).update({models.Participants.attempts: data['attempts']})
        models.db.session.commit()
        #updates the hints
        query = models.db.session.query(models.Participants).filter(models.Participants.email == user['email'], models.Participants.team_name == user['team_name'], models.Participants.hunts_id == user['hunts_id']).update({models.Participants.hints: data['hints']})
        models.db.session.commit()
        #updates the score
        query = models.db.session.query(models.Participants).filter(models.Participants.email == user['email'], models.Participants.team_name == user['team_name'], models.Participants.hunts_id == user['hunts_id']).update({models.Participants.score: data['score']})
        models.db.session.commit()
        
        query = models.db.session.query(models.Participants).filter(models.Participants.email == user['email'], models.Participants.team_name == user['team_name'], models.Participants.hunts_id == user['hunts_id'])
        for row in query:
            if row.start_time != None and row.end_time != None:
                time = timeScore((row.end_time-row.start_time).total_seconds())
                userData = {'email':user['email'], 'team_name':user['team_name'], 'hunts_id':user['hunts_id'], 'progress':data['progress'], 'score':data['score'] + time, 'attempts':data['attempts'], 'hints':data['hints'], 'start_time':row.start_time.strftime("%Y-%m-%d %H:%M:%S"), 'end_time':row.end_time.strftime("%Y-%m-%d %H:%M:%S")}
                query = models.db.session.query(models.Participants).filter(models.Participants.email == user['email'], models.Participants.team_name == user['team_name'], models.Participants.hunts_id == user['hunts_id']).update({models.Participants.score: data['score']+time})
                models.db.session.commit()
                return json.dumps({'user':userData})
                
        userData = {'email':user['email'], 'team_name':user['team_name'], 'hunts_id':user['hunts_id'], 'progress':data['progress'], 'score':data['score'], 'attempts':data['attempts'], 'hints':data['hints'], 'start_time':user['start_time'], 'end_time':user['end_time']}
        return json.dumps({'user':userData})
    except Exception as e: 
        print(e)
    
def timeScore(total):
    hours = total / 60 / 60;
    if(hours <= 2):
        score = 500
    else:
        score = 500 - (60 * (int(hours) - 2))
        if(score < 0):
            score = 0
    return score

@socketio.on('updateTime')
def updateTime(data):
    user = data['user']
    if(data['start_time'] != ""):
        try:
            #updates end_time
            query = models.db.session.query(models.Participants).filter(models.Participants.email == user['email'], models.Participants.team_name == user['team_name'], models.Participants.hunts_id == user['hunts_id']).update({models.Participants.start_time: datetime.datetime.now()})
            models.db.session.commit()
        
        except Exception as e: 
            print(e)
    if(data['end_time'] != ""):
        try:
            #updates end_time
            query = models.db.session.query(models.Participants).filter(models.Participants.email == user['email'], models.Participants.team_name == user['team_name'], models.Participants.hunts_id == user['hunts_id']).update({models.Participants.end_time: datetime.datetime.now()})
            models.db.session.commit()
        
        except Exception as e: 
            print(e)
            
@socketio.on('updateQuestion')
def updateQuestion(data):
    try:
        question = data
        
        #updates the progress
        query = models.db.session.query(models.Questions).filter(models.Questions.id == question['id']).update({models.Questions.question: question['question']})
        models.db.session.commit()
        query = models.db.session.query(models.Questions).filter(models.Questions.id == question['id']).update({models.Questions.answer: question['answer']})
        models.db.session.commit()
        query = models.db.session.query(models.Questions).filter(models.Questions.id == question['id']).update({models.Questions.image: question['image']})
        models.db.session.commit()
        query = models.db.session.query(models.Questions).filter(models.Questions.id == question['id']).update({models.Questions.hint_A: question['h1']})
        models.db.session.commit()
        query = models.db.session.query(models.Questions).filter(models.Questions.id == question['id']).update({models.Questions.hint_B: question['h2']})
        models.db.session.commit()
        query = models.db.session.query(models.Questions).filter(models.Questions.id == question['id']).update({models.Questions.answer_text: question['answer_text']})
        models.db.session.commit()
    except Exception as e: 
        print("Error: updateQuestion query broke")
        print(e)
        
@socketio.on('updateHunt')
def updateHunt(data):
    try:
        start = datetime.datetime.strptime(hunt['start_time'], '%m/%d/%Y')
        end = datetime.datetime.strptime(hunt['end_time'], '%m/%d/%Y')
        start = start.replace(hour=12)
        end = end.replace(hour=12)
        hunt = data
        #updates the progress
        query = models.db.session.query(models.Hunts).filter(models.Hunts.id == hunt['id']).update({models.Hunts.name: hunt['name']})
        models.db.session.commit()
        query = models.db.session.query(models.Hunts).filter(models.Hunts.id == hunt['id']).update({models.Hunts.h_type: hunt['type'].lower()})
        models.db.session.commit()
        query = models.db.session.query(models.Hunts).filter(models.Hunts.id == hunt['id']).update({models.Hunts.image: hunt['image']})
        models.db.session.commit()
        query = models.db.session.query(models.Hunts).filter(models.Hunts.id == hunt['id']).update({models.Hunts.desc: hunt['desc']})
        models.db.session.commit()
        query = models.db.session.query(models.Hunts).filter(models.Hunts.id == hunt['id']).update({models.Hunts.start_time: start})
        models.db.session.commit()
        query = models.db.session.query(models.Hunts).filter(models.Hunts.id == hunt['id']).update({models.Hunts.end_time: end})
        models.db.session.commit()
        query = models.db.session.query(models.Hunts).filter(models.Hunts.id == hunt['id']).update({models.Hunts.start_text: hunt['start_text']})
        models.db.session.commit() 
    except Exception as e: 
        print(e)
    
@socketio.on('filterHunts') #get hunts that match search term
def filterHunts(data):
    searchterm = data['str']
    hunts = []
    try:
        query = models.db.session.query(models.Hunts)
        for row in query:
            if searchterm.lower() in row.name.lower():
                hunts.append({'id':row.id,'name':row.name,'h_type':row.h_type,'desc':row.desc,'image':row.image,'start_time':row.start_time.strftime('%A %B %-d'),'end_time':row.end_time.strftime('%A %B %-d'),'start_text':row.start_text })
            elif searchterm.lower() in row.h_type.lower():
                hunts.append({'id':row.id,'name':row.name,'h_type':row.h_type,'desc':row.desc,'image':row.image,'start_time':row.start_time.strftime('%A %B %-d'),'end_time':row.end_time.strftime('%A %B %-d'),'start_text':row.start_text })
        return json.dumps({'hunts':hunts})
    except Exception as e: 
        print(e)

@socketio.on('getLeaderboard')
def getLeaderboard(data):
    teams = []
    try:
        sql = models.db.session.query(
            models.Participants.progress,
            models.Participants.score,
            models.Participants.team_name,
            models.Participants.start_time,
            models.Participants.end_time,
            models.Participants.hunts_id).filter(
                sqlalchemy.and_(
                    models.Participants.hunts_id == data['index'],
                    models.Participants.end_time != None
                )).order_by(models.Participants.score.desc())
            
        for row in sql:
            timedif = row.end_time - row.start_time
            if 'day' in str(timedif): #if days, format d:h:m:s
                time = str(timedif).split('.')[0].split(' ')[0] + ':' + str(timedif).split('.')[0].split(' ')[2] 
            else: #if no days, add filler 0 days for js handling
                time = '0:' + str(timedif).split('.')[0]
            teams.append({'progress':row.progress, 'score':row.score,'team_name':row.team_name, 'time':time,'hunts_id':row.hunts_id})
        
    except:
        print("Error: leaderboard query broke")
    
    return json.dumps({'users':teams})

@socketio.on('complete')
def complete(data):
    socketio.emit('updateComplete', 'updateComplete');

@socketio.on('getTime')
def getTime(data):
    try:
        sql = models.db.session.query(models.Participants).filter(models.Participants.id == data)
        for row in sql:
            timedif = row.end_time - row.start_time
            if 'day' in str(timedif): #if days, format d:h:m:s
                time = str(timedif).split('.')[0].split(' ')[0] + ':' + str(timedif).split('.')[0].split(' ')[2] 
            else: #if no days, add filler 0 days for js handling
                time = '0:' + str(timedif).split('.')[0]
            return (time)
    except:
        print("Error: can't getTime")
    
@socketio.on('register')
def updateRegister(data):
    ongoingHunts = [];
    try:
        sql = models.db.session.query(models.Hunts.id,models.Hunts.name,models.Hunts.h_type).filter(sqlalchemy.and_(models.Hunts.start_time <= datetime.datetime.now(),models.Hunts.end_time >= datetime.datetime.now())).order_by(models.Hunts.id.asc())
        for row in sql:
            ongoingHunts.append({'id':row.id,'name':row.name,'h_type':row.h_type})
        socketio.emit('updateRegister', ongoingHunts)
    except:
        print("Error: Database does not exist")

@socketio.on('createHunt')
def createHunt(data):
    try:
        start = datetime.datetime.strptime(data['sDate'], '%m/%d/%Y')
        end = datetime.datetime.strptime(data['eDate'], '%m/%d/%Y')
        start = start.replace(hour=12)
        end = end.replace(hour=12)
        hunts = models.Hunts(data['name'], data['type'].lower(), data['desc'], data['url'], start, end, data['st'])
        models.db.session.add(hunts)  
        models.db.session.commit()
        try:
            hunt = models.db.session.query(models.Hunts).filter(models.Hunts.name == data['name'], models.Hunts.h_type == data['type'])
            for row in hunt:
                id = row.id
            try:
                for x in range(0, len(data['question'])):
                    questions = models.Questions(data['question'][x], data['answer'][x], data['image'][x], data['hint1'][x], data['hint2'][x], data['answer_text'][x], id)
                    models.db.session.add(questions)
                    models.db.session.commit()
            except Exception as e: 
                print(e)
        except Exception as e: 
            print(e)
    except Exception as e: 
        print(e)
    
@socketio.on('checkUserInfo')
def checkUserInfo(data):
    userdata = data['userdata']
    if models.db.session.query(models.Participants).filter(models.Participants.email == userdata['email'], models.Participants.hunts_id == userdata['hunts_id']).count() > 0:
        return json.dumps({'condition':'reject','message':"Email address already registered for this hunt."})
    elif models.db.session.query(models.Participants).filter(models.Participants.team_name == userdata['team_name'], models.Participants.hunts_id == userdata['hunts_id']).count() > 0:
        return json.dumps({'condition':'reject','message':"Team name already registered for this hunt."})
    else:
        price = calculatePrice(userdata['discount_code'])
        return json.dumps({'condition':'accept','price':price})
    
def calculatePrice(discount_code):
    price = 50
    discount_percent = 0
    try:
        discount_query = models.db.session.query(models.Discounts)
        for row in discount_query:
            if checkPassword(row.code, discount_code) and row.uses > 0:
                discount_percent = discount_query.first().percent
                discount_query.first().uses -= 1
                models.db.session.commit()
                break
    except:
        print("Error: couldn't connect to discount table")
        pass
    
    # price's base unit is one cent, so 100 = $1
    price = price * (100 - discount_percent)
    
    return price

@socketio.on('checkout')
def checkout(data):
    stripe.api_key = "sk_test_O6BW3ED77qHecdLRd832IdjW"
    token = data['token']
    userdata = data['userdata']
    team_name = userdata['team_name']
    client_email = userdata['email']
    hunt_id = userdata['hunts_id']
    price = data['price']
    
    # create account
    random.seed();
    random_number = random.randint(0,9999)
    hunt_name = models.db.session.query(models.Hunts).filter(models.Hunts.id == hunt_id).first().name
    hunt_name = ''.join(e for e in hunt_name if e.isalnum())
    leader_code = hunt_name + "{:04d}".format(random_number)
    
    random.seed();
    random_number = random.randint(0,9999)
    member_code = hunt_name + "{:04d}".format(random_number)
    
    participant = None
    try:
        participant = models.Participants(client_email, team_name, userdata['image'], hashPassword(leader_code), hashPassword(member_code), None, None, 0, 0, 0, 0, False, hunt_id)
        models.db.session.add(participant)  
        models.db.session.commit()
        
        participant = models.db.session.query(models.Participants).filter(models.Participants.team_name == team_name).first()
    except:
        return json.dumps({'condition':'reject','message':'Could not connect to database.'})
    
    try:
        if price != 0:
            # stripe.Subscription.create(
            #   customer="cus_4fdAW5ftNQow1a",
            #   items=[
            #     {
            #       "plan": "basic-monthly",
            #     },
            #   ],
            # )
            charge = stripe.Charge.create(
                amount=price,
                currency="usd",
                description="Coastal Quest Scavenger Hunt",
                source=token,
            )
        
        participant.has_paid = True
        models.db.session.commit()
    except stripe.error.CardError as e:
        body = e.json_body
        err  = body.get('error', {})
        models.db.session.delete(participant)
        models.db.session.commit()
        return json.dumps({'condition':'not_paid', 'error_code':err.get('code')})
    except stripe.error.StripeError as e:
        models.db.session.delete(participant)
        models.db.session.commit()
        return json.dumps({'condition':'not_paid', 'error_code':None})
    
    # send email
    try:
        subject = "Coastal Quest Activation Code"
        message = "Welcome to Coastal Quest Scavenger Hunts, {}! \nHere is your access code to play the hunt: \nTeam Leader: {}\nHave fun on your journey!".format(team_name,leader_code)
        emailClient(client_email,subject,message)
    except:
        print("Error: Could not send email")
        pass
    
    # send access code back to JS app
    return json.dumps({'condition':'confirm','leader_code':leader_code, 'member_code':member_code})

@socketio.on('admins')
def getAdmin(data):
    socketio.emit('callbackUpdateAdmin', 'callbackUpdateAdmin')

@socketio.on('loadAllAdmins')
def loadAllAdmins(data):
    adminList = []
    count = 0
    try:
        sql = models.db.session.query(models.Admins)

        for row in sql:
            adminList.append({'id':row.id,'email':row.email, 'username':row.username, 'is_super':row.is_super})
            if (row.is_super):
                count+=1
        return json.dumps({'adminList':adminList,'count':count})
    except:
        print("Error: admin query broke")


@socketio.on('addAdmin')
def addAdmin(data):
    admin = models.Admins(data['email'], data['team_name'], hashPassword(data['access_code']), data['is_super'])
    models.db.session.add(admin)
    models.db.session.commit()

@socketio.on('deleteAdminFace')
def deleteAdmin(data):
    try:
        sql = models.db.session.query(models.Admins).filter(models.Admins.id == data).delete()
        models.db.session.commit()
        return "Nothing"
    except:
        print("Error: delete admin query broke")

@socketio.on('updateAdmin')
def updateAdmin(data):
    try:
        sql = models.db.session.query(models.Admins).filter(models.Admins.id == data['id']).update({models.Admins.email: data['email']})
        models.db.session.commit()
        sql = models.db.session.query(models.Admins).filter(models.Admins.id == data['id']).update({models.Admins.username: data['username']})
        models.db.session.commit()
        sql = models.db.session.query(models.Admins).filter(models.Admins.id == data['id']).update({models.Admins.is_super: data['is_super']})
        models.db.session.commit()
        getAdmin('data')
    except:
        print("Error: update admin query broke")


        



@socketio.on('adminHunts')
def getHunts(data):
    huntsList = []
    try:
        sql = models.db.session.query(
            models.Hunts.id,
            models.Hunts.name,
            models.Hunts.h_type,
            models.Hunts.desc,
            models.Hunts.image,
            models.Hunts.start_time,
            models.Hunts.end_time,
            models.Hunts.start_text
            ).order_by(models.Hunts.id)

        for row in sql:
            huntsList.append({'id':row.id, 'name':row.name, 'h_type':row.h_type, 'desc':row.desc, 'image':row.image, 'start_time':row.start_time.strftime('%m/%d/%Y'), 'end_time':row.end_time.strftime('%m/%d/%Y'), 'start_text':row.start_text})
    except:
        print("Error: Hunts Admin query broke")
    socketio.emit('getHunts', {
        'getHunts': huntsList
    })
    
def setAnnounceTime():
	announceTime = datetime.datetime.now()
	if announceTime.hour >= announceHour and announceTime.minute >= announceMinute:
		announceTime = announceTime + datetime.timedelta(days=1)
	announceTime = announceTime.replace(hour=announceHour, minute=announceMinute, second=0, microsecond=0)

    
def emailClient(client_email, subject, message):
    recp_message  = 'Subject: {}\n\n{}'.format(subject, message)
    email_address = "jasonisspecialized@live.com"
    email_pass = "CoastalQuestsAreFun" #change password
    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.starttls()
    server.login(email_address, email_pass)
    server.sendmail(email_address, client_email, recp_message)
    server.quit()
    
def hashPassword(password):
    salt = uuid.uuid4().hex + uuid.uuid4().hex
    return hashlib.sha256(salt.encode() + password.encode()).hexdigest() + ':' + salt

def checkPassword(hashed_password, user_password):
    password, salt = hashed_password.split(':')
    return password == hashlib.sha256(salt.encode() + user_password.encode()).hexdigest()

if __name__ == '__main__':
    socketio.run(
            app,
            host=os.getenv('IP', '0.0.0.0'),
            port=int(os.getenv('PORT', 8080)),
            debug=True,
            use_reloader=False
            )
            