import {fireEvent,render,screen,within} from '@testing-library/react';
import {ProductActivationSection} from './ProductActivationSection';
import {parseActivationRequirements} from './productActivationModel';
import type {ProductActivationController} from './useProductActivationController';
const attempt={productId:'p1',attemptId:1,generation:1};
function controller(overrides:Partial<ProductActivationController>={}):ProductActivationController{return {
 operation:null,readiness:null,unknownOutcome:null,conflict:null,productMissing:false,error:null,feedback:null,
 activate:jest.fn(),reconcile:jest.fn(),canActivate:()=>true,invalidateReadiness:jest.fn(),hasRisk:false,hasImmediateRisk:()=>false,...overrides,
};}
test.each(['active','archived'] as const)('%s hides action but keeps unresolved recovery',status=>{
 const c=controller({unknownOutcome:attempt});render(<ProductActivationSection status={status} controller={c} contextRevision={0} blocked={false} onGoToRequirement={jest.fn()}/>);
 expect(screen.queryByRole('button',{name:'Aktivovat produkt'})).not.toBeInTheDocument();expect(screen.getByText('Výsledek aktivace není potvrzený')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'Načíst aktuální stav produktu'}));expect(c.reconcile).toHaveBeenCalledTimes(1);
});
test('pending has real visible label and xs spinner; work guard explains disabled action',()=>{
 render(<ProductActivationSection status="draft" controller={controller({operation:{...attempt,kind:'activate'},canActivate:()=>false})} contextRevision={0} blocked onGoToRequirement={jest.fn()}/>);
 const pending=screen.getByRole('button',{name:'Aktivování…'});expect(pending).toBeDisabled();expect(pending).toHaveAttribute('aria-busy','true');expect(pending).toHaveTextContent('Aktivování…');expect(pending.querySelector('[aria-hidden="true"]')).toBeInTheDocument();expect(screen.getByText('Nejprve uložte, dokončete nebo vyřešte rozpracovanou práci na této stránce.')).toBeInTheDocument();
});
test('requirements are semantic, only known actionable keys have jumps and stale context stays visible',()=>{
 const go=jest.fn();render(<ProductActivationSection status="draft" controller={controller({readiness:{attemptId:1,contextRevisionAtAttempt:0,superseded:false,requirements:parseActivationRequirements(['name','status','new-rule'])}})} contextRevision={1} blocked={false} onGoToRequirement={go}/>);
 const list=screen.getByRole('list');expect(within(list).getAllByRole('listitem')).toHaveLength(3);expect(within(list).getAllByRole('button')).toHaveLength(1);fireEvent.click(screen.getByRole('button',{name:'Přejít na Název'}));expect(go).toHaveBeenCalledWith('name');expect(screen.getByText('Kód požadavku: new-rule')).toBeInTheDocument();expect(screen.getByText('Výsledek posledního pokusu už nemusí odpovídat aktuálním údajům.')).toBeInTheDocument();
});
test('confirmed and observed activation feedback are distinct',()=>{
 const {rerender}=render(<ProductActivationSection status="active" controller={controller({feedback:'confirmed-active'})} contextRevision={0} blocked={false} onGoToRequirement={jest.fn()}/>);expect(screen.getByRole('status')).toHaveTextContent('Produkt byl aktivován.');
 rerender(<ProductActivationSection status="active" controller={controller({feedback:'observed-active'})} contextRevision={0} blocked={false} onGoToRequirement={jest.fn()}/>);expect(screen.getByRole('status')).toHaveTextContent('Produkt je nyní aktivní.');
});
