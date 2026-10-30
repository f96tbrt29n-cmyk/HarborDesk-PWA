'use strict';
// Pure expected-condition factory. Strict consumers still compare the complete
// LOS object and exact condition; only an explicit source flag adds its band.
function routeAuditNumericCondition(los){
 const first=los.checks[0],numeric={kind:'scoutingValue',min:first.safe,coef:los.coef,...(los.preserveRandomBand===true?{failBelow:first.failBelow}:{})};
 return los.exemptWhen?{any:[los.exemptWhen,numeric],reason:los.exemptNote}:numeric;
}
module.exports={routeAuditNumericCondition};
