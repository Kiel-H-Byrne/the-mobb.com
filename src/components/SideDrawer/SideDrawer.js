import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
});

function SideDrawer() {
  const classes = useStyles();
  const [state, setState] = React.useState({
    left: false,
    bottom: false,
    right: false,
  });

  const toggleDrawer = (side, open) => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState({ ...state, [side]: open });
  };

  const sideList = side => (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(side, false)}
      onKeyDown={toggleDrawer(side, false)}
    >
      <List>
        {['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {['All mail', 'Trash', 'Spam'].map((text, index) => (
          <ListItem button key={text}>
            <ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <div>
      <Button onClick={toggleDrawer('right', true)}>Open Right</Button>
      <Drawer anchor="right" open={state.right} onClose={toggleDrawer('right', false)}>
        {sideList('right')}
      </Drawer>
    </div>
  );
}

export default SideDrawer;


<Drawer name="sideCard">

      <a href="#" data-activates="slide-out" class="hide button-collapse"></a>
  <ul id="slide-out" class="side-nav sideCard">
    {{#with currentDoc}}
    <li>
      <div class="card transparent">
        <div class="card-image">
          {{#if image.url}}
            <a href="{{url}}" target="_blank" rel="noopener"><img src="{{image.url}}" /></a>
          {{else}}
            {{#if url}}
            {{!-- {{> mPreloader}} --}}
            <a href="{{url}}" target="_blank" rel="noopener"><img src="{{getImage url _id}}"/></a>
            {{/if}}
          {{/if}}
          <span class="card-title">{{name}} <br />
            {{#if description}}
              <em>{{description}}</em>
            {{/if}}  
          </span>
        </div>
        <div class="card-content">
        <table class="">
          <tr>
          {{#if address}}    
          <td><i class="material-icons" style="font-size:100%; margin-right:2px; ">public</i></td>
          <td>{{address}}</td>
          {{else}}
          <td><i class="material-icons" style="font-size:100%; margin-right:2px; ">public</i></td>
          <td>{{street}}, {{city}}, {{state}}  {{zip}} </td>
          {{/if}}
          </tr>
        {{#if url}}
          <tr>
            <td><i class="material-icons">link</i></td>
            <td><a class="waves-effect" target="_blank" rel="noopener" title="Visit Website" href="{{url}}">{{url}}</a></td>
          </tr>
        {{/if}}
        {{#if phone}}    
          <tr>
            <td><i class="material-icons" style="font-size:100%; margin-right:2px; ">call</i></td>
            <td><a class="waves-effect" title="Call Us!" href="tel:+1{{phone}}">{{phone}}</a> </td>
          </tr>
        {{/if}}
        </table>
        <table class="">
        {{#if social.facebook}}
        <tr>
          <td>FB: </td>
          <td><a href="https://www.facebook.com/{{social.facebook}}" target="_blank" rel="noopener" > @{{social.facebook}}</a></td>
        </tr>
        {{/if}}
        {{#if social.instagram}}
        <tr>
          <td>IG: </td>
          <td><a href="https://www.instagram.com/{{social.instagram}}" target="_blank" rel="noopener" > @{{social.instagram}}</a></td>
        </tr>
        {{/if}}
        {{#if social.twitter}}
        <tr>
          <td>TT: </td>
          <td><a href="https://www.twitter.com/{{social.twitter}}" target="_blank" rel="noopener" > @{{social.twitter}}</a> </td>
        </tr>
        {{/if}}
        </table>
        </div>
        <button class="button_get-directions btn-floating halfway-fab btn-large waves-effect waves-dark z-depth-4 animated">
              <i class="large material-icons">directions</i>
        </button>
      </div>

    </li>
    <li><div class="divider"></div></li>
    <li>
      <ul class="inline-list actionBar">
        <li><a class="tooltipped" title="Save This Business" data-position="bottom" data-delay="50" data-tooltip="Save This Business" aria-label="Save This Business">
              <tr>{{> favoriteStar}}</tr>
              <tr>Save</tr>
            </a>
        </li>
        {{#if isOwner}}    
        <!-- NO CLAIM BUTTON !-->
        {{else if currentUser}}
        <li><a class="tooltipped claim_link" data-position="bottom" data-delay="50" data-tooltip="Claim This Business" aria-label="Claim This Business">
          <tr><i class="material-icons">fingerprint</i></tr>
          <tr>Claim</tr>
        </a></li>
        {{else}}
        <li><a class="tooltipped claim_link" onClick="event.stopPropagation(); Materialize.toast('Log In Before Claiming A Business', 3000, 'myToast')" data-position="bottom" data-delay="50" data-tooltip="Claim This Business" aria-label="Claim This Business">
          <tr><i class="material-icons">fingerprint</i></tr>
          <tr>Claim</tr>
        </a></li>
        {{/if}}

        {{#if isOwner}}    
        <li><a class="modal-trigger tooltipped" title="Edit This Listing" href="#modalEdit" data-position="bottom" data-delay="50" data-tooltip="Edit This Business" aria-label="Edit This Business">
            <tr><i class="material-icons">edit</i></tr>
            <tr>Edit</tr>
        </a></li>
        {{else if currentUser}}
        <!-- NO EDIT BUTTON !-->
        {{else }}
        <li><a class="tooltipped" title="Make Suggestion" href="#" onClick="event.stopPropagation(); Materialize.toast('Log In Before Editing A Business', 3000, 'myToast')" data-position="bottom" data-delay="50" data-tooltip="Make Suggestion" aria-label="Make a Suggestion">
          <tr><i class="material-icons">edit</i></tr>
          <tr>Edit</tr>
        </a></li>        
        {{/if}}
        <li><a class="tooltipped" title="Share" href="#" data-position="bottom" data-delay="50" data-tooltip="Share This Business" aria-label="Share This Business">
          <tr><i class="material-icons">share</i></tr>
          <tr>Share</tr>
        </a></li>        
        <li class="verifyItem">
        {{#if currentUser}} 
          {{> verifyUI}}
        {{else}}
        <a class="tooltipped modal-trigger" title="Verify" href="#loginModal" onClick="event.stopPropagation(); Materialize.toast('Log In Before Verifying A Business', 3000, 'myToast')" data-position="bottom" data-delay="50" data-tooltip="Verify This Business" aria-label="Verify This Business">
          <tr><i class="material-icons">verified_user</i></tr>
          <tr>Verify</tr>
        </a>
        {{/if}}
      </li>  
      </ul>
    </li>
      {{#if google_id}}
        {{#let place=thisPlace}}
          {{#if place.opening_hours}}
          <li><div class="divider"></div></li>
          <li class="item_hours">
            <span class="section-title"><i class="material-icons">watch_later</i>Hours: </span>
            {{#if isOpen place}}
            <span class="now_open">Open Now!</span>
            {{else}}
            <span class="now_closed muted">Closed Now</span>
            {{/if}}
            <ul class="list_hours">
              {{#each place.opening_hours.weekday_text}}
              <li>{{this}}</li>
              {{/each}}
            </ul>
          </li>
          {{/if}}
          {{#if place.photos}}
          <li><div class="divider"></div></li>  
          <li class="item_photos">
            <span class="section-title"><i class="material-icons">star</i>Photos</span><br />
            <div class="row photos_wrapper slider">
              <ul class="slides">
              {{#each place.photos}}
                {{> sliderPhoto}}
              {{/each}}
              </ul>
            </div>
          </li>
          {{/if}}
          {{#if place.reviews}}
          <li><div class="divider"></div></li>
          <li class="item_reviews">
            <span class="section-title"><i class="material-icons">star</i>Reviews</span><br />
            <ul class="collection">
            {{#each review in place.reviews}}
            <li class="collection-item">
              <div class="row">
                <div class="col s4">
                  <div class="">
                    <a href="{{review.author_url}}" class="" ><img src="{{review.profile_photo_url}}" alt="{{review.author_name}}" class="" /></a>
                  </div>
                </div>
                <div class="col s8">
                  <a href="{{review.author_url}}"><h6>{{review.author_name}}</h6>
                  <span class="">{{review.relative_time_description}} </span> </a>
                  <span class="badge right" data-badge-caption="/5">{{review.rating}}</span>
                </div>
              </div>
              {{#if review.text}}
              <div class="col s12" >
                <p>{{review.text}}</p>
              </div>
              {{/if}}
            </li>
            {{/each}}
            </ul>
          </li>
          {{/if}}
          <li><div class="divider"></div></li>
          <li>
            <a class="btn button_leave-review" href="https://search.google.com/local/writereview?placeid={{google_id}}" target="_blank" rel="noopener"><i class="material-icons">rate_review</i>Leave Your Review</a>
          </li>
        {{/let}}
      {{/if}}
    {{/with}}
  </ul>
</Drawer>