import * as React from 'react';

//pages
import { Socket } from './Socket';
import { Home } from './home';
import { Explore } from './explore';
import { Register } from './register';
import { AdminHome } from './admin/adminHome';
import { AdminLeaderboard } from './admin/adminLeaderboard';
import { AdminHunts } from './admin/adminHunts';
import { AdminCreateHunt } from './admin/adminCreateHunt';
import { Admins } from './admin/admins';
import { AdminCreate } from './admin/adminCreate';

//navigation bar used in admin login
import { NavBar } from './admin/nav-bar';

//contains all pages rendered for scavenger hunt
export class Content extends React.Component{
    constructor(props) {
        super(props);
        this.state = { //essentially session vars, default values
            id: -1,
            name: 'guest', //team name or admin user name default value
            loggedIn: 'no', //no,admin,superAdmin,team,teamLead default value
            lastPage: 'home', //last page loaded, set this dynamically default value
            hide:'none', //determines whether or not buttons and inputs are visible during gameplay default value
            select: -1 //value of the hunt that the user is viewing default value, resets to default when user returns to home
        };
        this.images = ['boats','bust','canneryrow','crossedarms','lighthousewide','montereycanningcompany','sistercitypark','swanboat','whale']; //images for slideshow on home
        // IMAGES THAT SHOW UP SIDEWAYS: 'diversmemorial','lady','lighthousenarrow','shareabench','twowhales', 'yesterdaysdream'
        this.index = 0; //index for the image slideshow on home page
        this.changePage = this.changePage.bind(this); //changes the visibility of classes, default of all classes is 'hide'
        this.setProps = this.setProps.bind(this); //changes value of state variables to new values
        this.logOutSetProps = this.logOutSetProps.bind(this); //sets state variables back to default values
        this.ready = this.ready.bind(this); //connects to server to retrieve last saved session variable values
        this.start = this.start.bind(this); //renders last page user was on if page is refreshed or closed //if no last page, home page renders
        this.showSlides = this.showSlides.bind(this); //renders slideshow
    }
    
    //changes the visibility of classes, default of all classes is 'hide'
    changePage(location){
        console.log(location);
        try{
            Socket.emit(location, this.state);
            if(location.indexOf('admin') != -1){ //it is admin page
                document.getElementById(this.state.lastPage).style.display = "none";
                document.getElementById(location).style.display = "block";
                document.getElementById('nav-bar').style.display = "block";
            }
            else if(location.indexOf('admin') == -1){ //not admin
                document.getElementById(this.state.lastPage).style.display = "none";
                document.getElementById(location).style.display = "block";
                document.getElementById('nav-bar').style.display = "none";
            }
            this.state.lastPage = location;
            window.localStorage.setItem('state',JSON.stringify(this.state));
        }catch(e){
            console.log(e);
        }
    }
    componentDidMount(){
        try{ //get state from localstorage
            var obj = JSON.parse(window.localStorage.state);
            this.setState(obj, this.ready);
        }catch(e){
            Socket.emit('home', this.state, Socket.callback=this.start);
        }
    }
    //sets state variables back to default values
    logOutSetProps(){
        this.setState({
            id: -1,
            loggedIn: 'no',
            name: 'guest',
            hide:'none'  //UNHIDE BEFORE BETA
        });
        this.changePage('home');
    }
    //connects to server to retrieve last saved session variable values
    ready(){
        Socket.emit('home', this.state, Socket.callback=this.start);
    }
    //changes value of state variables to new values
    setProps(prop, value){
        var obj  = {};
        obj[prop] = value;
        this.setState(obj);
        // UNHIDE BEFORE BETA
        if(this.state.loggedIn == 'teamLead' || this.state.loggedIn == 'superAdmin'){
            this.setState({
                hide:'block'
            });
        }
        else{
            this.setState({
                hide:'none'
            });
        }
    }
    //renders slideshow
    showSlides() {
        var image = document.getElementById("ss-image");
        if (this.index < this.images.length){
            image.src="../static/image/gallery/"+this.images[this.index]+".jpg";
            this.index+=1;
        }
        else{
            this.index=0;
        }
        if(this.state.lastPage == 'home'){
            setTimeout(this.showSlides, 7000); // Change image every 7 seconds
        }
    }
    //renders last page user was on if page is refreshed or closed //if no last page, home page renders
    start(lastPage){
        try{
            if(lastPage.includes("home")){
                this.showSlides();
                document.getElementById("home").style.display = "block";
            }
            else{
                this.changePage(lastPage);
            }
        }
        catch(e){ //first connect, no last page?
            console.log(e);
        }
    }
    
    render(){
            return (
                <div>
                    <div id = 'home' style={{display:'none'}}>
                        <Home changePage={this.changePage} state={this.state} setProps={this.setProps} />
                    </div>
                    <div id = 'explore' style={{display:'none'}}>
                        <Explore changePage={this.changePage} setProps={this.setProps} key="explore"/>
                    </div>
                    <div id = 'register' style={{display:'none'}}>
                        <Register changePage={this.changePage}/>
                    </div>
                    <div id = 'nav-bar' style={{display:'none'}}>
                        <NavBar changePage={this.changePage} state={this.state} logOutSetProps={this.logOutSetProps}/>
                    </div>
                    <div id = 'adminHome' style={{display:'none'}}>
                        <AdminHome changePage={this.changePage} state={this.state}/>
                    </div>
                    <div id = 'adminLeaderboard' style={{display:'none'}}>
                        <AdminLeaderboard changePage={this.changePage} setProps={this.setProps} state={this.state}/>
                    </div>
                    <div id = 'adminHunts' style={{display:'none'}}>
                        <AdminHunts changePage={this.changePage}/>
                    </div>
                    <div id = 'adminCreateHunt' style={{display:'none'}}>
                        <AdminCreateHunt changePage={this.changePage}/>
                    </div>
                    <div id = 'admins' style={{display:'none'}}>
                        <Admins changePage={this.changePage} state={this.state} logOutSetProps={this.logOutSetProps}/>
                    </div>
                    <div id = 'adminCreate' style={{display:'none'}}>
                        <AdminCreate changePage={this.changePage}/>
                    </div>
                </div>
            );
    }
}