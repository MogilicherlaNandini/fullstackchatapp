import { Buffer } from 'buffer';
import global from 'global';

window.global = global;
window.Buffer = Buffer;