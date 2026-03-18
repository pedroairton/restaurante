import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartProductComponent } from './chart-product.component';

describe('ChartProductComponent', () => {
  let component: ChartProductComponent;
  let fixture: ComponentFixture<ChartProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
