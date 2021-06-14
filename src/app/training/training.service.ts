import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs';
import 'rxjs/add/operator/map';

import { AuthData } from '../auth/auth-data.model';
import { Exercise } from './exercise.model';


@Injectable()
export class TrainingService {
  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();
  userLogged : '';
  private availableExercises: Exercise[] = [];
  private runningExercise: Exercise;
  private fbSubs: Subscription[] = [];
  private fbUser: Subscription[] = [];

  constructor(private db: AngularFirestore) {}

  fetchAvailableExercises() {
    this.fbSubs.push(this.db
      .collection('availableExercises')
      .snapshotChanges()
      .map(docArray => {
        return docArray.map(doc => {
          return {
            id: doc.payload.doc.id,
            name: doc.payload.doc.data()['name'],
            duration: doc.payload.doc.data()['duration'],
            calories: doc.payload.doc.data()['calories']
            
          };
        });        
      })
      
      .subscribe((exercises: Exercise[]) => {
        this.availableExercises = exercises;
        this.exercisesChanged.next([...this.availableExercises]);
        
      }));
  }

  startExercise(selectedId: string) {
    // this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()});
    this.runningExercise = this.availableExercises.find(
      ex => ex.id === selectedId
    );
    this.exerciseChanged.next({ ...this.runningExercise });
  }

  completeExercise() {
    this.addDataToDatabase({
      ...this.runningExercise,
      date: new Date(),
      state: 'finalizado',
      user: this.userLogged
      
    });
    
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * (progress / 100),
      calories: this.runningExercise.calories * (progress / 100),
      date: new Date(),
      state: 'cancelado',
      user: this.userLogged
      
    });
    this.runningExercise = null;
    this.exerciseChanged.next(null);
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }

  fetchCompletedOrCancelledExercises() {
    this.fbSubs.push(this.db
      .collection('finishedExercises', ref => ref.where('user','==', this.userLogged))
      .valueChanges()
      .subscribe((exercises: Exercise[]) => {
        this.finishedExercisesChanged.next(exercises);
      }));
  }

  cancelSubscriptions() {
    this.fbSubs.forEach(sub => sub.unsubscribe());
  }

  msgSubscribe(email){
    this.fbUser.forEach(emailSub => email.subscribe());
    this.userLogged = email;
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }


}
