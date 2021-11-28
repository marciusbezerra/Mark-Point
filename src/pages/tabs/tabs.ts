import { ListMarkersPage } from './../list-markers/list-markers';
import { HomePage } from './../home/home';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Events } from 'ionic-angular';

/**
 * Generated class for the TabsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {

  tabMap: any = HomePage;
  tabMakers: any = ListMarkersPage;

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    public events: Events) {
  }

  tabMapSelected() {
    this.events.publish('updateMap');
  }

  tabListMarkersSelected() {
    this.events.publish('updateListMakers');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TabsPage');
  }

}
