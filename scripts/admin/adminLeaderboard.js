import * as React from 'react';
import * as ReactBootstrap from 'react-bootstrap';
import { Socket } from '../Socket';
import { Button } from 'react-bootstrap';
import { InputGroup } from 'react-bootstrap';
import { FormControl } from 'react-bootstrap';
import { FormGroup } from 'react-bootstrap';
import { Form } from 'react-bootstrap';
import { ButtonToolbar } from 'react-bootstrap';
import { ButtonGroup } from 'react-bootstrap';

// import { Socket } from './Socket';

export class AdminLeaderboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'filteredHunts': [],
            'users': []
        };
        this.pageName = 'adminLeaderboard';
        this.handleSubmit = this.handleSubmit.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.changePage = this.changePage.bind(this);
        this.showLeaderboard = this.showLeaderboard.bind(this);
        this.filterHunts = this.filterHunts.bind(this);
        this.handleHunts = this.handleHunts.bind(this);
        this.handleUsers = this.handleUsers.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

    }
    changePage(page){
        this.props.setProps('select',-1);
        this.props.changePage(page);
    }
    componentDidMount(){
        Socket.on('filteredHunts', (data) => {
            this.setState({
                'filteredHunts': data
            });
        });
    }
    filterHunts(str){
        Socket.emit('filterHunts', {'str':str}, Socket.callback=this.handleHunts);
    }
    showLeaderboard(index){
        Socket.emit('getLeaderboard', {'index':index}, Socket.callback=this.handleUsers);
    }
    handleHunts(callback){
        var data = JSON.parse(callback);
        this.setState({
            'filteredHunts': data['hunts']
        });
    }
    handleUsers(callback){
        var data = JSON.parse(callback);
        var users = [];
        
        for(var i = 0; i < data['users'].length; i++) {
            var user = data['users'][i];
            var time = user.time.substring().split(':');
            var team_name = user.team_name;
            var score = user.score;
            // whole days
            var days = time[0];
            // whole hours
            var hours = time[1];
            //  whole minutes
            var minutes = time[2];
            //  seconds
            var seconds = time[3];

            users[i] = [team_name, score, days, hours, minutes, seconds];
        }
        this.setState({
            'users': users
        });
    }
    render() {
        var huntList = '';
        let userlist = '';
        huntList = this.state.filteredHunts.map(
                (n, index) =>
                <tr key={0}>
                <td><b>Title</b></td>
                <td><b>Start Date</b></td>
                <td><b>End Date</b></td>
                <td><b>Show Leaderboard</b></td>
                </tr>
             );
            
        huntList.push(this.state.filteredHunts.map(
            (n, index) =>               
            <tr key={index}>
            <td>{n.name}</td>
            <td>{n.start_time}</td>
            <td>{n.end_time}</td>
            <td><Button onClick={() => this.showLeaderboard(n.id)}>Leaderboard</Button></td>
            </tr>
         ));
        
        if (this.state.users.length > 0){
            userlist = this.state.users.map(
                (n, index) =>
                <tr key={index}><td>{index+1}</td> <td>{n[0]}</td><td>{n[1]}</td>
                <td>{n[2] != 0 ? <div>{n[2]} d<br/></div> : <div/>}
                    {n[3] != 0 ? <div>{n[3]} h<br/></div> : <div/>}
                    {n[4] != 0 ? <div>{n[4]} m<br/></div> : <div/>}
                    {n[5] != 0 ? <div>{n[5]} s<br/></div> : <div/>}
                </td></tr>
            );
        }
        
        
        return (
            <div>
                <div id = 'header'>
                    <header>Admin Leaderboard Page</header>
                </div>
                <div id='search'>
                    <div id='leaderboard-form'>
                          <input  id = "leaderboard-search1" className="form-control " placeholder="Search Hunts" size="5" />
                          <button id = "leaderboard-search" className="btn" onClick={() => this.filterHunts(document.getElementById('leaderboard-search1').value)}>Search</button>
                    </div>
                </div>
                <div id='hunts'>
                    <div id="huntList">
                        <table id="hunt-table">
                            <tbody>
                                {huntList} 
                            </tbody>
                        </table>
                    </div>
                </div>
                <div id='leaderboards'>
                    <div id="userList">
                        <table id="leaderboard-table2">
                            <tbody>
                                {userlist}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        );
    }
}
