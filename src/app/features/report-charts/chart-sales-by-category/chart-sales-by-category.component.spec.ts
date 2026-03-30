import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSalesByCategoryComponent } from './chart-sales-by-category.component';

describe('ChartSalesByCategoryComponent', () => {
  let component: ChartSalesByCategoryComponent;
  let fixture: ComponentFixture<ChartSalesByCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartSalesByCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartSalesByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
