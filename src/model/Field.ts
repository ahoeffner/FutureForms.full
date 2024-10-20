/*
  MIT License

  Copyright © 2024 Alex Høffner

  Permission is hereby granted, free of charge, to any person obtaining a copy of this software
  and associated documentation files (the “Software”), to deal in the Software without
  restriction, including without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all copies or
  substantial portions of the Software.

  THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
  BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
  FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/


/**
 * The Field class represents a field or column in a record.
 * Fields holds different values.
 *
 * Original: The value of the backend.
 * Validated: The validated value.
 * Volatile: The value set by the application
 */
export class Field
{
   private name$:string = null;
   private valid$:boolean = true;
   private value$:Value = new Value();


   constructor(name:string, value?:any)
   {
      this.name$ = name;
      this.value$.original = value;
      this.value$.validated = value;
      this.value$.volatile = value;
   }


   /**
    * Returns the name of the field
    */
   public get name() : string
   {
      return(this.name$);
   }


   /**
    * @param value : The volatile value
    * @returns Itself
    */
   public setValue(value:any) : Field
   {
      this.valid$ = false;
      this.value$.volatile = value;
      return(this);
   }


   /**
    * @returns The volatile value
    */
   public getVolatileValue() : any
   {
      return(this.value$.volatile);
   }


   /**
    * @returns The validated value
    */
   public getValidatedValue() : any
   {
      return(this.value$.validated);
   }


   /**
    * @returns The original (backend) value
    */
   public getOriginalValue() : any
   {
      return(this.value$.original);
   }


   /**
    * Runs the validation triggers, and if success, marks the field validated
    * @returns The outcome
    */
   public async validate() : Promise<boolean>
   {
      if (this.valid$) return(true);

      // Fire a trigger
      this.valid$ = true;
      this.value$.validated = this.value$.original;
      return(true);
   }


   /**
    * Sets the validation status
    * @param flag True or false
    * @returns Itself
    */
   public setValidated(flag:boolean) : Field
   {
      if (flag)
      {
         this.valid$ = true;
         this.value$.validated = this.value$.original;
      }
      else
      {
         this.valid$ = false;
      }

      return(this);
   }


   /**
    * @returns Whether the field is validated
    */
   public isValidated() : boolean
   {
      return(this.valid$);
   }


   /**
    * Marks the field as being synchronized with backend
    * @returns
    */
   public setSynchronized() : Field
   {
      this.value$.original = this.value$.validated;
      return(this);
   }
}



class Value
{
   volatile:any = null;
   validated:any = null;
   original:any = null;
}