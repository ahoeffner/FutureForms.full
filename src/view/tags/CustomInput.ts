import { Tag } from "./Tag.js";
import { Parser } from "../Parser.js";


export class CustomInput extends Tag
{
   // Shows recursive parsing
   public replace(clazz:any, element:HTMLElement, attr?:string) : HTMLElement
   {
      let input:HTMLInputElement = document.createElement("input");

      let parser:Parser = new Parser();
      parser.copyAllAttributes(element,input);
      parser.parseElement(clazz,input);

      return(input);
   }
}
