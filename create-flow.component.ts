// src/app/pages/create-flow/create-flow.component.ts
import { Component, inject, signal } from '@angular/core';
import { FlowService } from '../../services/flow.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateFlowRequestDto } from '../../models/flow.models';

@Component({
  standalone: true,
  selector: 'app-create-flow',
  imports: [FormsModule],
  template: `
    <h2>Criar Fluxo de Aprovação</h2>

    <form (ngSubmit)="submit()" #f="ngForm" style="display:grid; gap:12px; max-width:420px;">
      <label>
        Título
        <input type="text" [(ngModel)]="model.title" name="title" required />
      </label>

      <label>
        Blueprint Id
        <input type="number" [(ngModel)]="model.blueprintId" name="blueprintId" required />
      </label>

      <label>
        Quantidade de Aprovadores
        <select [(ngModel)]="model.approverCount" name="approverCount" required>
          <option [ngValue]="1">1</option>
          <option [ngValue]="2">2</option>
          <option [ngValue]="3">3</option>
          <option [ngValue]="4">4</option>
        </select>
      </label>

      <!-- Modo "fake" para escolher aprovadores apenas visual (UI), não muda o backend -->
      <fieldset style="border:1px solid #eee; padding:10px;">
        <legend>Aprovadores (visual / mock)</legend>
        <small>Somente para teste visual. O backend resolve perfis pela variante.</small>
        <div *ngFor="let i of [].constructor(model.approverCount); let idx = index" style="margin-top:6px;">
          <label> Aprovador {{idx+1}} (ProfileId):
            <input type="number" [(ngModel)]="approversMock[idx]" name="ap{{idx}}" />
          </label>
        </div>
      </fieldset>

      <button type="submit" [disabled]="f.invalid || loading()">Criar</button>
    </form>

    <div *ngIf="error()" style="color:#b00; margin-top:10px;">{{error()}}</div>
  `
})
export class CreateFlowComponent {
  private flow = inject(FlowService);
  private router = inject(Router);

  model: CreateFlowRequestDto = {
    title: 'Compra #123',
    blueprintId: 1,
    approverCount: 3
  };

  approversMock: number[] = [2,3,4]; // só UI
  loading = signal(false);
  error = signal<string | null>(null);

  submit() {
    this.error.set(null);
    this.loading.set(true);
    this.flow.create(this.model).subscribe({
      next: res => {
        this.loading.set(false);
        this.router.navigate(['/flow', res.requestId, 'tasks']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.error ?? 'Falha ao criar fluxo');
      }
    });
  }
}
