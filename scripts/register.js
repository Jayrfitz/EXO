import * as React from 'react';
import { Button } from 'react-bootstrap';
import { Socket } from './Socket';
import { LogoSmall } from './logo-small';

export class Register extends React.Component {
    constructor(props) {
        super(props);
        this.pageName = 'register';
        this.stripe = Stripe('pk_test_50M0ZvrdCP5uiJUU0yUCa6o8');
        this.elements = this.stripe.elements();
        this.card = this.elements.create('card', {
            style: {
              base: {
                iconColor: '#666EE8',
                color: '#31325F',
                lineHeight: '40px',
                fontWeight: 300,
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSize: '15px',
          
                '::placeholder': {
                  color: '#CFD7E0',
                },
              },
            }
        });
        this.userdata = {
            team_name: '',
            email: '',
            hunts_id: '',
            image: '',
            discount_code: ''
        };
        this.hunts = [];
        
        this.token = null;
        
        this.setOutcome = this.setOutcome.bind(this);
        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleHuntChange = this.handleHuntChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleCardChange = this.handleCardChange.bind(this);
        this.handleDiscountChange = this.handleDiscountChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleConfirm = this.handleConfirm.bind(this);
        this.handleBack = this.handleBack.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this.handleFormReject = this.handleFormReject.bind(this);
        this.handleCallback = this.handleCallback.bind(this);
    }
    
    componentDidMount() {
        // Add an instance of the card Element into the `card-element` <div>
        this.card.mount('#card-element');
        // var ongoingHunts = [];
        Socket.on('updateRegister', (data) => {
            // for(var key in data) { //convert object to array, prep for mapping
            //     var hunt = [data[key].id,data[key].name,data[key].h_type];
            //     ongoingHunts.push(hunt);
            // }
            this.hunts = data;
            this.forceUpdate(); //DONT ASK ME WHY THIS WORKS BUT IT WORKS, DO NOT DELETE
        });
    }
    
    handleSubmit(event) {
        event.preventDefault();
        // Handle form submission
        var outcomeElement = document.getElementById('form-outcome');
        outcomeElement.textContent = '';
        
        var this_ = this;
        
        // check errors that regex can catch
        var re = /^.+$/;
        var OK = re.exec(this.userdata.team_name);
        if(!OK) {
            this.handleFormReject('No team name entered.');
            return 0;
        }
        
        OK = re.exec(this.userdata.email);
        if(!OK) {
            this.handleFormReject('No email address entered.');
            return 0;
        }
        
        OK = re.exec(this.userdata.hunts_id);
        if(!OK) {
            this.handleFormReject('No hunt selected.');
            return 0;
        }
        
        re = /[^@]+@[^@]+\.[^@]+/;
        OK = re.exec(this.userdata.email);
        if(!OK) {
            this.handleFormReject('Invalid email address.');
            return 0;
        }
        
         this.token = this.stripe.createToken(this.card).then(function(result) {
            if (result.error) {
                this_.handleFormReject(result.error.message);
                return null;
            } 
            else {
                Socket.emit('checkUserInfo',{'userdata':this_.userdata}, Socket.callback=this_.handleCallback);
                return result.token.id;
            }
        });
    }
    
    handleConfirm(event) {
        var this_ = this;
        
        this.token.then(function(token) {
            Socket.emit('checkout', {'token':token, 'userdata':this_.userdata, 'price':this_.price}, Socket.callback=this_.handleCallback);
        });
        
        document.getElementById('stripe-confirm').style.display = 'none';
        document.getElementById('stripe-process').style.display = 'block';
    }
    
    handleBack(event) {
        document.getElementById('stripe-success').style.display = 'none';
        document.getElementById('stripe-confirm').style.display = 'none';
        document.getElementById('stripe-form').style.display = 'block';
    }
    
    handleExit(nextPage) {
        document.getElementById('stripe-form').style.display = 'block';
        document.getElementById('stripe-confirm').style.display = 'none';
        document.getElementById('stripe-process').style.display = 'none';
        document.getElementById('stripe-success').style.display = 'none';
        document.getElementById('home-button').style.display = 'block';
        
        document.getElementById("stripe-form").reset();
        this.userdata.discount_code = '';
        this.userdata.email = '';
        this.userdata.hunts_id = '';
        this.userdata.image = '';
        this.userdata.team_name = '';
        this.token = null;
        this.card.clear();
        while (this.hunts.length) {
            this.hunts.pop();
        }
        
        this.props.changePage(nextPage);
    }
    
    handleCallback(callback){
        var data = JSON.parse(callback);
        
        if (data['condition'] == 'reject'){
            this.handleFormReject(data['message']);
        }
        else if (data['condition'] == 'accept'){
            document.getElementById('stripe-form').style.display = 'none';
            document.getElementById('stripe-confirm').style.display = 'block';
            document.getElementById('home-button').style.display = 'none';
            
            this.price = data['price'];
            document.getElementById('price-slot').textContent = this.price/100;
        }
        else if (data['condition'] == 'confirm'){
            document.getElementById('stripe-process').style.display = 'none';
            document.getElementById('stripe-success').style.display = 'block';
            document.getElementById('success-text').style.display = 'block';
            document.getElementById('failure-text').style.display = 'none';
            document.getElementById('home-button').style.display = 'none';
            
            document.getElementById('leader-code-slot').textContent = data['leader_code'];
            // document.getElementById('member-code-slot').textContent = data['member_code'];
        }
        else if (data['condition'] == 'not_paid'){
            document.getElementById('stripe-process').style.display = 'none';
            document.getElementById('stripe-success').style.display = 'block';
            document.getElementById('success-text').style.display = 'none';
            document.getElementById('failure-text').style.display = 'block';
            document.getElementById('home-button').style.display = 'block';
            
            if(data['error_code'] == null){
                document.getElementById('error-text').style.display = 'none';
            }
            else{
                document.getElementById('error-text').style.display = 'block';
                document.getElementById('error-code-slot').textContent = data['error_code'];
            }
        }
    }
    
    handleFormReject(message){
        var outcomeElement = document.getElementById('form-outcome');
        outcomeElement.style.visibility = 'visible';
        outcomeElement.textContent = "Error: " + message;
        outcomeElement.style.color = "#f2e537";
        outcomeElement.style.textAlign = "center";
    }
    
    handleNameChange(event) {
        event.preventDefault();
        this.userdata.team_name = event.target.value;
    }
    handleDiscountChange(event) {
        event.preventDefault();
        this.userdata.discount_code = event.target.value;
    }
    handleEmailChange(event) {
        event.preventDefault();
        this.userdata.email = event.target.value;
    }
    handleHuntChange(event) {
        event.preventDefault();
        this.userdata.hunts_id = event.target.value;
    }
    handleCardChange(event) {
        event.preventDefault();
        this.setOutcome(event);
    }
    
    setOutcome(result) {
        var outcomeElement = document.getElementById('form-outcome');
        if (result.error) {
          outcomeElement.textContent = result.error.message;
        }
    }
    
    render() { 
        let hunts = this.hunts.map((n, index) => 
            <option value={n[0]} >{n[1]} - {n[2].charAt(0).toUpperCase() + n[2].slice(1)}</option>
        );
        return (
            <div>
                <div id = 'logo-small'>
                    <LogoSmall/>
                </div>
                <div id = 'header'>
                    <header>Register</header>
                </div>
                <div id="intro">
                    <form id = 'stripe-form' onSubmit={this.handleSubmit}>
                        <div className="group">
                          <label>
                            <span>Team</span>
                            <input className="field" placeholder="My Team Name" onChange={this.handleNameChange} />
                          </label>
                          <label>
                            <span>Email</span>
                            <input className="field" placeholder="sample@email.com" type="email" onChange={this.handleEmailChange}/>
                          </label>
                          <label>
                            <span>Card</span>
                            <div id="card-element" className="field" onChange={this.handleCardChange}></div>
                          </label>
                          <label>
                            <span>Code</span>
                            <input className="field" placeholder="PromoCode1234" onChange={this.handleDiscountChange}/>
                          </label>
                        </div>
                        <div className="group full">
                            <label>Number of Policies</label>
                            {hunts}
                        </div>
                        <button type="submit">Register and Pay</button>
                        
                        <div className="clear"></div>
                    </form>
                    
                    <div id = 'stripe-confirm' style={{display:'none'}}>
                        <div className="confirm-group">
                            <div id="confirm-text">
                                <span><b>Your total:</b> $</span>
                                <span id="price-slot"></span><br/>
                                <span>Please press confirm to join this hunt.</span>
                            </div>
                            <div id = "buttons">
                                <button id="confirm-button" className="btn" onClick={this.handleConfirm}>Confirm</button>
                                <button className="btn" onClick={this.handleBack}>Cancel</button>
                            </div>
                        </div>
                    </div>
                    
                    <div id = 'stripe-process' style={{display:'none'}}>
                        <div className="confirm-group">
                            <div id="process-text">Processing...</div>
                        </div>
                    </div>
                    
                    <div id = 'stripe-success' style={{display:'none'}} >
                        <div className="confirm-group">
                            <div id="success-text" style={{display:'block'}}>
                                <div>Thank you for your purchase!<br/><b>Your access code: </b>
                                    <span id="leader-code-slot"></span><br/>
                                    <span>Return to the home page and log in to begin.</span>
                                </div>
                                <button className="btn" onClick={()=> this.handleExit('home')}>Accept</button>
                            </div>
                            <div id = 'failure-text' style={{display:'none'}}>
                                <div>We're sorry, your payment did not go through. <br/>Please return to the previous screen to try again.</div>
                                <div id='error-text' style={{display:'block'}}>
                                    <span>Error code: </span>
                                    <span id="error-code-slot"></span>
                                </div>
                                <button className="btn" onClick={this.handleBack}>Back</button>
                            </div>
                            
                        </div>
                    </div>
                    
                    <div style={{textAlign:'center'}} id="form-outcome" style={{visibility:'hidden'}}>center</div>
                </div>
                <div className='buttons' id="home-button">
                    <button className='btn' onClick={()=> this.handleExit('explore')}>Back</button>
                    <button className='btn' onClick={()=> this.handleExit('home')}>Home</button>
                </div>
            </div>
         
        );
    }
}