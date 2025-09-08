// src/app/services/flow.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CreateFlowRequestDto, FlowRequestResultDto, TaskViewDto, DecideDto } from '../models/flow.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FlowService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/flowconfiguration`;

  create(dto: CreateFlowRequestDto): Observable<FlowRequestResultDto> {
    return this.http.post<FlowRequestResultDto>(`${this.base}/requests`, dto);
  }

  getCurrentTask(requestId: number): Observable<TaskViewDto | null> {
    return this.http.get<TaskViewDto>(`${this.base}/requests/${requestId}/tasks/current`);
  }

  getNextTask(requestId: number): Observable<TaskViewDto | null> {
    return this.http.get<TaskViewDto>(`${this.base}/requests/${requestId}/tasks/next`);
  }

  getPrevTask(requestId: number): Observable<TaskViewDto | null> {
    return this.http.get<TaskViewDto>(`${this.base}/requests/${requestId}/tasks/prev`);
  }

  approve(requestId: number, dto: DecideDto) {
    return this.http.post<void>(`${this.base}/requests/${requestId}/approve`, dto);
  }

  reject(requestId: number, dto: DecideDto) {
    return this.http.post<void>(`${this.base}/requests/${requestId}/reject`, dto);
  }

  cancel(requestId: number) {
    return this.http.post<void>(`${this.base}/requests/${requestId}/cancel`, {});
  }
}
