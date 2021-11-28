import { ListIconsPage } from './../list-icons/list-icons';
import { MarkerPoint } from './../../models/marker-point';
import { Component, ViewChild, Input } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, ViewController, PopoverController } from 'ionic-angular';

/**
 * Generated class for the EditMarkerPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-edit-marker',
  templateUrl: 'edit-marker.html',
})
export class EditMarkerPage {

  markerPoint: MarkerPoint;
  @ViewChild('titleInput') titleInput;

  constructor(platform: Platform, public navCtrl: NavController, public navParams: NavParams,
    public viewCtrl: ViewController,
    private popoverCtrl: PopoverController) {
    platform.ready().then(() => {
      this.markerPoint = navParams.get('markerPoint');
      console.log('edit: ' + JSON.stringify(this.markerPoint));
    });
  }

  save() {
    this.viewCtrl.dismiss(this.markerPoint);
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  selectIcon(markerPoint: MarkerPoint) {
    let popover = this.popoverCtrl.create(ListIconsPage);
    popover.present();
    popover.onDidDismiss((selectedIcon: string) => {
      if (selectedIcon)
        markerPoint.icon = selectedIcon;
    });
  }

  ionViewDidLoad(){
    setTimeout(() => {
      this.titleInput.setFocus();
    }, 150);   
  }

}
