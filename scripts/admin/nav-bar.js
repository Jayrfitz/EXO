import * as React from 'react';
import { LogoSmall } from '../logo-small';


export class NavBar extends React.Component {
    constructor(props) {
    super(props);
    }

    render() {
        return (
            <div>
                <div id="topnav">
                    <a onClick={() => this.props.changePage('adminHome')}>Home</a>
                    <a onClick={() => this.props.changePage('adminLeaderboard')}>Leaderboard</a>
                    <a onClick={() => this.props.changePage('adminHunts')}>Hunts</a>
                    <a style={{display:this.props.state.hide}} onClick={() => this.props.changePage('admins')}>Settings</a>
                    <a onClick={() => this.props.logOutSetProps()}>Logout</a>
                    <div id = 'logo-small-nav'>
                    <LogoSmall />
                </div>
                </div> 
            </div>
         
        );
    }
}