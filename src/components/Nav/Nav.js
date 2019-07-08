import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import InputBase from '@material-ui/core/InputBase';
import Badge from '@material-ui/core/Badge';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import { fade } from '@material-ui/core/styles/colorManipulator';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import MoreIcon from '@material-ui/icons/MoreVert';

import MapAutoComplete from './MapAutoComplete';
// import AppFilter from './AppFilter'

export default class PrimarySearchAppBar extends React.Component {

	constructor(props) {
		super(props);
	}

	render(props) {

		return (
			<AppBar position="static" className="App-header">
				<Toolbar>
					[LOGO] - - - [NavList] -  [Filter] - [Search]
				</Toolbar>
			</AppBar>
		);
	}
}
