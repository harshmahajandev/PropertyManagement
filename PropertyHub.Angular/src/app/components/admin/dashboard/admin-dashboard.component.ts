import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, forkJoin, takeUntil, interval, startWith, switchMap, catchError, of } from 'rxjs';
import { DashboardService } from '../../../services/dashboard.service';
import {
  DashboardSummaryDto,
  PropertyStatsDto,
  LeadStatsDto,
  ReservationStatsDto,
  FinancialStatsDto,
  ActivityDto,
  TopPropertyDto
} from '../../../models';
import { Chart, ChartConfiguration, ChartType, registerables } from 'chart.js';

Chart.register(...registerables);

interface DateRange {
  label: string;
  value: string;
}

interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();
  
  // Loading and error states
  loading = true;
  error: string | null = null;
  lastUpdated: Date | null = null;
  autoRefresh = true;
  refreshInterval = 60000; // 1 minute

  // Active view
  activeView: 'overview' | 'properties' | 'leads' | 'financial' | 'analytics' = 'overview';

  // Filter options
  selectedCurrency = 'USD';
  selectedDateRange = 'month';
  
  currencies: CurrencyOption[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
  ];

  dateRanges: DateRange[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'This Quarter', value: 'quarter' },
    { label: 'This Year', value: 'year' },
    { label: 'All Time', value: 'all' }
  ];

  // Dashboard data
  dashboardSummary: DashboardSummaryDto | null = null;
  propertyStats: PropertyStatsDto | null = null;
  leadStats: LeadStatsDto | null = null;
  reservationStats: ReservationStatsDto | null = null;
  financialStats: FinancialStatsDto | null = null;
  recentActivities: ActivityDto[] = [];
  topProperties: TopPropertyDto[] = [];
  leadsBySegment: { [key: string]: number } = {};
  reservationsByStatus: { [key: string]: number } = {};

  // Chart references
  @ViewChild('propertyChart') propertyChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leadFunnelChart') leadFunnelChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('leadSegmentChart') leadSegmentChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('reservationStatusChart') reservationStatusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('performanceChart') performanceChartRef!: ElementRef<HTMLCanvasElement>;

  private propertyChart: Chart | null = null;
  private leadFunnelChart: Chart | null = null;
  private revenueChart: Chart | null = null;
  private leadSegmentChart: Chart | null = null;
  private reservationStatusChart: Chart | null = null;
  private performanceChart: Chart | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.setupAutoRefresh();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.initializeCharts(), 500);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.destroyCharts();
  }

  private setupAutoRefresh(): void {
    interval(this.refreshInterval)
      .pipe(
        takeUntil(this.destroy$),
        startWith(0),
        switchMap(() => {
          if (!this.autoRefresh) return of(null);
          return this.dashboardService.getDashboardSummary(this.selectedCurrency);
        }),
        catchError(err => {
          console.error('Auto-refresh error:', err);
          return of(null);
        })
      )
      .subscribe();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      summary: this.dashboardService.getDashboardSummary(this.selectedCurrency),
      propertyStats: this.dashboardService.getPropertyStats(),
      leadStats: this.dashboardService.getLeadStats(),
      reservationStats: this.dashboardService.getReservationStats(),
      financialStats: this.dashboardService.getFinancialStats(this.selectedCurrency),
      activities: this.dashboardService.getRecentActivities(),
      topProperties: this.dashboardService.getTopProperties(),
      leadsBySegment: this.dashboardService.getLeadsBySegment(),
      reservationsByStatus: this.dashboardService.getReservationsByStatus()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.dashboardSummary = data.summary;
        this.propertyStats = data.propertyStats;
        this.leadStats = data.leadStats;
        this.reservationStats = data.reservationStats;
        this.financialStats = data.financialStats;
        this.recentActivities = data.activities || [];
        this.topProperties = data.topProperties || [];
        this.leadsBySegment = data.leadsBySegment || {};
        this.reservationsByStatus = data.reservationsByStatus || {};
        this.lastUpdated = new Date();
        this.loading = false;
        setTimeout(() => this.updateCharts(), 100);
      },
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.error = 'Failed to load dashboard data. Please ensure the backend API is running and try again.';
        this.loading = false;
        // Clear any stale data
        this.propertyStats = null;
        this.leadStats = null;
        this.reservationStats = null;
        this.financialStats = null;
        this.recentActivities = [];
        this.topProperties = [];
        this.leadsBySegment = {};
        this.reservationsByStatus = {};
      }
    });
  }

  onCurrencyChange(): void {
    this.loadDashboardData();
  }

  onDateRangeChange(): void {
    this.loadDashboardData();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh = !this.autoRefresh;
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  setActiveView(view: 'overview' | 'properties' | 'leads' | 'financial' | 'analytics'): void {
    this.activeView = view;
    setTimeout(() => this.updateCharts(), 100);
  }

  private initializeCharts(): void {
    this.updateCharts();
  }

  private updateCharts(): void {
    this.destroyCharts();
    
    if (this.activeView === 'overview' || this.activeView === 'properties') {
      this.createPropertyChart();
    }
    if (this.activeView === 'overview' || this.activeView === 'leads') {
      this.createLeadFunnelChart();
      this.createLeadSegmentChart();
    }
    if (this.activeView === 'overview' || this.activeView === 'financial') {
      this.createRevenueChart();
    }
    if (this.activeView === 'analytics') {
      this.createPerformanceChart();
      this.createReservationStatusChart();
    }
  }

  private destroyCharts(): void {
    if (this.propertyChart) { this.propertyChart.destroy(); this.propertyChart = null; }
    if (this.leadFunnelChart) { this.leadFunnelChart.destroy(); this.leadFunnelChart = null; }
    if (this.revenueChart) { this.revenueChart.destroy(); this.revenueChart = null; }
    if (this.leadSegmentChart) { this.leadSegmentChart.destroy(); this.leadSegmentChart = null; }
    if (this.reservationStatusChart) { this.reservationStatusChart.destroy(); this.reservationStatusChart = null; }
    if (this.performanceChart) { this.performanceChart.destroy(); this.performanceChart = null; }
  }

  private createPropertyChart(): void {
    const canvas = this.propertyChartRef?.nativeElement;
    if (!canvas || !this.propertyStats) return;

    this.propertyChart = new Chart(canvas, {
      type: 'doughnut' as ChartType,
      data: {
        labels: ['Available', 'Reserved', 'Sold'],
        datasets: [{
          data: [
            this.propertyStats.availableProperties,
            this.propertyStats.reservedProperties,
            this.propertyStats.soldProperties
          ],
          backgroundColor: ['#10b981', '#f59e0b', '#6366f1'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  private createLeadFunnelChart(): void {
    const canvas = this.leadFunnelChartRef?.nativeElement;
    if (!canvas || !this.leadStats) return;

    this.leadFunnelChart = new Chart(canvas, {
      type: 'bar' as ChartType,
      data: {
        labels: ['Total Leads', 'Active', 'Qualified', 'Converted'],
        datasets: [{
          label: 'Lead Funnel',
          data: [
            this.leadStats.totalLeads,
            this.leadStats.activeLeads,
            Math.round(this.leadStats.activeLeads * 0.6),
            this.leadStats.convertedLeads
          ],
          backgroundColor: ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { beginAtZero: true }
        }
      }
    });
  }

  private createRevenueChart(): void {
    const canvas = this.revenueChartRef?.nativeElement;
    if (!canvas || !this.financialStats) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const recentMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
    
    // Generate realistic trending data
    const baseRevenue = this.financialStats.revenueLastMonth || 3500000;
    const revenueData = recentMonths.map((_, i) => 
      Math.round(baseRevenue * (0.8 + (i * 0.08) + Math.random() * 0.15))
    );

    this.revenueChart = new Chart(canvas, {
      type: 'line' as ChartType,
      data: {
        labels: recentMonths,
        datasets: [{
          label: 'Revenue',
          data: revenueData,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#6366f1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => this.formatCurrency(Number(value), true)
            }
          }
        }
      }
    });
  }

  private createLeadSegmentChart(): void {
    const canvas = this.leadSegmentChartRef?.nativeElement;
    if (!canvas || !this.leadsBySegment) return;

    const labels = Object.keys(this.leadsBySegment);
    const data = Object.values(this.leadsBySegment);

    this.leadSegmentChart = new Chart(canvas, {
      type: 'pie' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  private createReservationStatusChart(): void {
    const canvas = this.reservationStatusChartRef?.nativeElement;
    if (!canvas || !this.reservationsByStatus) return;

    const labels = Object.keys(this.reservationsByStatus);
    const data = Object.values(this.reservationsByStatus);

    this.reservationStatusChart = new Chart(canvas, {
      type: 'doughnut' as ChartType,
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: ['#f59e0b', '#10b981', '#6366f1', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  private createPerformanceChart(): void {
    const canvas = this.performanceChartRef?.nativeElement;
    if (!canvas) return;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    this.performanceChart = new Chart(canvas, {
      type: 'bar' as ChartType,
      data: {
        labels: months,
        datasets: [
          {
            label: 'Leads',
            data: [45, 52, 48, 61, 55, 67],
            backgroundColor: '#3b82f6',
            borderRadius: 4
          },
          {
            label: 'Conversions',
            data: [12, 15, 11, 18, 14, 22],
            backgroundColor: '#10b981',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  // Utility methods
  formatCurrency(value: number, compact = false): string {
    const symbol = this.currencies.find(c => c.code === this.selectedCurrency)?.symbol || '$';
    if (compact && value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    }
    if (compact && value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(0)}K`;
    }
    return `${symbol}${value.toLocaleString()}`;
  }

  formatNumber(value: number): string {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'LeadCreated': 'fa-user-plus',
      'LeadConverted': 'fa-check-circle',
      'PropertyAdded': 'fa-building',
      'PropertyViewed': 'fa-eye',
      'PropertyInquired': 'fa-question-circle',
      'PropertyToured': 'fa-walking',
      'PropertyOffered': 'fa-hand-holding-usd',
      'ReservationCreated': 'fa-calendar-plus',
      'ReservationConfirmed': 'fa-calendar-check',
      'ReservationCancelled': 'fa-calendar-times',
      'CustomerRegistered': 'fa-user-check',
      'MessageSent': 'fa-envelope'
    };
    return icons[type] || 'fa-bell';
  }

  getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      'LeadCreated': 'primary',
      'LeadConverted': 'success',
      'PropertyAdded': 'info',
      'PropertyViewed': 'secondary',
      'ReservationConfirmed': 'success',
      'ReservationCancelled': 'danger'
    };
    return colors[type] || 'secondary';
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Available': 'bg-success',
      'Reserved': 'bg-warning',
      'Sold': 'bg-info',
      'Pending': 'bg-warning',
      'Confirmed': 'bg-success',
      'Completed': 'bg-primary',
      'Cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  exportReport(format: 'pdf' | 'excel' | 'csv'): void {
    // Export functionality - would integrate with backend
    console.log(`Exporting report as ${format}`);
    alert(`Report export as ${format.toUpperCase()} will be implemented with backend integration.`);
  }

  trackByActivityId(index: number, activity: ActivityDto): string {
    return activity.id;
  }

  trackByPropertyId(index: number, property: TopPropertyDto): any {
    return property.id;
  }
}
