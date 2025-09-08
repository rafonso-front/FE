// src/app/pages/task-center/task-center.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FlowService } from '../../services/flow.service';
import { FormsModule } from '@angular/forms';
import { TaskViewDto, DecideDto } from '../../models/flow.models';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-task-center',
  imports: [FormsModule, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault],
  template: `
    <h2>Centro de Tarefas</h2>
    <div>RequestId: <b>{{requestId()}}</b></div>

    <section style="margin-top:12px; border:1px solid #eee; padding:12px;">
      <h3>Task Atual</h3>
      <button (click)="loadCurrent()" [disabled]="loading()">Recarregar</button>

      <div *ngIf="error()" style="color:#b00; margin-top:8px;">{{error()}}</div>

      <div *ngIf="task() as t; else noTask" style="margin-top:10px;">
        <div><b>{{t.title}}</b></div>
        <div>TaskId: {{t.taskId}}</div>
        <div>Step Ordinal: {{t.ordinal}}</div>
        <div>ProfileId: {{t.profileId}}</div>
        <div>Status: {{t.status}}</div>

        <div style="margin-top:10px;">
          <label>Decided by:
            <input [(ngModel)]="decidedByUser" />
          </label>
          <label style="margin-left:8px;">Note:
            <input [(ngModel)]="note" />
          </label>
        </div>

        <div style="display:flex; gap:8px; margin-top:10px;">
          <button (click)="approve()" [disabled]="loading()">Approve ▶</button>
          <button (click)="reject()" [disabled]="loading()">◀ Reject</button>
          <button (click)="cancel()" [disabled]="loading()">Cancelar Workflow</button>
        </div>
      </div>

      <ng-template #noTask>
        <div style="margin-top:10px;">Nenhuma task READY encontrada. O fluxo pode ter finalizado.</div>
      </ng-template>
    </section>

    <section style="margin-top:12px; border:1px solid #eee; padding:12px;">
      <h3>Navegação</h3>
      <div style="display:flex; gap:8px; margin-top:6px;">
        <button (click)="loadPrev()" [disabled]="loading()">Ver Task Anterior</button>
        <button (click)="loadNext()" [disabled]="loading()">Ver Próxima Task</button>
      </div>

      <div *ngIf="navTask() as nt" style="margin-top:10px;">
        <div><b>{{nt.title}}</b></div>
        <div>Ordinal: {{nt.ordinal}} | Status: {{nt.status}}</div>
      </div>
    </section>
  `
})
export class TaskCenterComponent {
  private route = inject(ActivatedRoute);
  private flow = inject(FlowService);

  requestId = signal<number>(0);
  task = signal<TaskViewDto | null>(null);
  navTask = signal<TaskViewDto | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  decidedByUser = 'rafael';
  note = '';

  constructor() {
    this.route.paramMap.subscribe(p => {
      const id = Number(p.get('requestId'));
      this.requestId.set(id);
      this.loadCurrent();
    });
  }

  loadCurrent() {
    this.error.set(null);
    this.loading.set(true);
    this.flow.getCurrentTask(this.requestId()).subscribe({
      next: t => { this.task.set(t); this.loading.set(false); },
      error: err => { this.loading.set(false); this.error.set(this._msg(err)); this.task.set(null); }
    });
  }

  loadNext() {
    this.error.set(null);
    this.loading.set(true);
    this.flow.getNextTask(this.requestId()).subscribe({
      next: t => { this.navTask.set(t); this.loading.set(false); },
      error: err => { this.loading.set(false); this.error.set(this._msg(err)); this.navTask.set(null); }
    });
  }

  loadPrev() {
    this.error.set(null);
    this.loading.set(true);
    this.flow.getPrevTask(this.requestId()).subscribe({
      next: t => { this.navTask.set(t); this.loading.set(false); },
      error: err => { this.loading.set(false); this.error.set(this._msg(err)); this.navTask.set(null); }
    });
  }

  approve() {
    if (!this.task()) return;
    this.loading.set(true);
    const dto: DecideDto = { decidedByUser: this.decidedByUser, note: this.note || null };
    this.flow.approve(this.requestId(), dto).subscribe({
      next: () => { this.loading.set(false); this.loadCurrent(); },
      error: err => { this.loading.set(false); this.error.set(this._msg(err)); }
    });
  }

  reject() {
    if (!this.task()) return;
    this.loading.set(true);
    const dto: DecideDto = { decidedByUser: this.decidedByUser, note: this.note || null };
    this.flow.reject(this.requestId(), dto).subscribe({
      next: () => { this.loading.set(false); this.loadCurrent(); },
      error: err => { this.loading.set(false); this.error.set(this._msg(err)); }
    });
  }

  cancel() {
    this.loading.set(true);
    this.flow.cancel(this.requestId()).subscribe({
      next: () => { this.loading.set(false); this.loadCurrent(); },
      error: err => { this.loading.set(false); this.error.set(this._msg(err)); }
    });
  }

  private _msg(err: any): string {
    return err?.error?.error || err?.message || 'Erro';
  }
}
