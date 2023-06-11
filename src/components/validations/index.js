export function allLetter(inputtxt)
  {
   let letters = /^[A-Za-z]+$/;
   if(inputtxt.match(letters))
     {
      return true;
     }
   else
     {
     return false;
     }
  }


  export function allnumeric(inputtxt)
   {
      var numbers = /^[0-9]+$/;
      if(inputtxt.match(numbers) && !inputtxt.startsWith('0') && Number(inputtxt) > 1)
      {
      return true;
      }
      else
      {
      return false;
      }
   }

   export function allDecimal(inputtxt)
   {
      var numbers = /^[0-9]+$/;
      if(inputtxt.match(numbers) && !inputtxt.startsWith('0') && inputtxt <= 9)
      {
      return true;
      }
      else
      {
      return false;
      }
   }

   export function numeric(inputtxt)
   {
      var numbers = /^[0-9]+$/;
      if(inputtxt.match(numbers) && !inputtxt.startsWith('0'))
      {
      return true;
      }
      else
      {
      return false;
      }
   }

   export function numericWithDecimal(inputtxt)
   {
      const decimalRegex = /^[0-9]\d*(?:\.\d{0,2})?$/ 
      // const nonDecimalRegex = /^\d+$/;
      if(inputtxt.match(decimalRegex)  )
      {
      return true;
      }
      else
      {
      return false;
      }
   }