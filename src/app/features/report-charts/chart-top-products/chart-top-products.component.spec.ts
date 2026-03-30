import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartTopProductsComponent } from './chart-top-products.component';

describe('ChartTopProductsComponent', () => {
  let component: ChartTopProductsComponent;
  let fixture: ComponentFixture<ChartTopProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartTopProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartTopProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
