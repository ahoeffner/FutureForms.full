/*
  MIT License

  Copyright © 2023 Alex Høffner

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

import { Field } from "./Field.js";


/**
 * The Record class represents a record of data.
 * Normally connected to a source
 */
export class Record
{
   private fields$:Map<string,Field> =
      new Map<string,Field>();


   /**
    * Runs the validation triggers, and if success, marks the field validated
    * @returns The outcome
    */
   public async validate() : Promise<boolean>
   {
      for (let [_name,field] of this.fields$)
      {
         if (!await field.validate())
            return(false);
      }

      // Fire a trigger
      return(true);
   }


   /**
    * Sets the validation status
    * @param flag True or false
    * @returns Itself
    */
   public setValidated(flag:boolean) : Record
   {
      for (let [_name,field] of this.fields$)
         field.setValidated(flag);

      return(this);
   }


   /**
    * @returns Whether the field is validated
    */
   public isValidated() : boolean
   {
      for (let [_name,field] of this.fields$)
      {
         if (!field.isValidated())
            return(false);
      }

      return(true);
   }


   /**
    * @param field : The field or name of field
    * @returns Itself
    */
   public createField(field:Field|string, value?:any) : Record
   {
      if (field instanceof Field)
      {
         field.setValue(value);
         this.fields$.set(field.name.toLowerCase(),field);
         return(this);
      }

      let name:string = field.toLowerCase();

      let fld:Field = new Field(field,value);
      this.fields$.set(name,fld);

      return(this);
   }


   /**
    * @param field : The field or name of field
    * @returns Itself
    */
   public deleteField(field:Field|string) : Record
   {
      if (field instanceof Field)
      {
         this.fields$.delete(field.name.toLowerCase());
         return(this);
      }

      this.fields$.delete(field.toLowerCase());
      return(this);
   }


   /**
    * @param field Name of field
    * @returns The field
    */
   public getField(field:string) : Field
   {
      let name:string = field.toLowerCase();
      return(this.fields$.get(name));
   }
}