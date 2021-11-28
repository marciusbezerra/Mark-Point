import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the ListIconsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-list-icons',
  templateUrl: 'list-icons.html',
})
export class ListIconsPage {

  constructor(
    private navCtrl: NavController, 
    private navParams: NavParams,
    private viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ListIconsPage');
  }

  selectItem(icon: string) {
    this.viewCtrl.dismiss(icon);
  }

}
