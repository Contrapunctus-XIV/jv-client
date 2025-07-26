export const DELAY = 20;
export const SECOND_DELAY = 1000;
export const CONNECTION_DELAY = 250;
export const DEFAULT_REQUEST_RETRIES = 5;
export const MINIMAL_UP_DELAY = 15;
export const DEFAULT_UP_DELAY = 25;

export const DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36";
export const DOMAIN = "www.jeuxvideo.com";
export const DOMAIN_URL = `https://${DOMAIN}`;
export const API_DOMAIN = "api.jeuxvideo.com";
export const API_VERSION = 4;
export const PARTNER_KEY = '550c04bf5cb2b';
export const HMAC_SECRET = 'd84e9e5f191ea4ffc39c22d11c77dd6c';

export const CDV_URL = `https://${DOMAIN}/profil/*?mode=infos`;
export const CDV_POSTS_URL = `https://${DOMAIN}/profil/*?mode=historique_forum`;
export const SMILEY_URL = "https://image.jeuxvideo.com/smileys_img/";
export const POST_URL = "https://www.jeuxvideo.com/forums/message/add";
export const TOPIC_POST_URL = "https://www.jeuxvideo.com/forums/topic/add"
export const NOELSHACK_UPLOAD_FILE_URL = "https://www.noelshack.com/webservice/envoi.json";
export const NOELSHACK_UPLOAD_FROM_URL = "https://www.noelshack.com/webservice/telecharger.json";
export const COMMENT_URL = `https://${DOMAIN}/commentaire/message`

export const EMOJI_REGEX = /©|®|‼|⁉|™|ℹ|[↔-↙]|↩|↪|⌚|⌛|⌨|⏏|[⏩-⏳]|[⏸-⏺]|Ⓜ|▪|▫|▶|◀|[◻-◾]|[☀-☄]|☎|☑|☔|☕|☘|☝|☠|☢|☣|☦|☪|☮|☯|[☸-☺]|♀|♂|[♈-♓]|♟|♠|♣|♥|♦|♨|♻|♾|♿|[⚒-⚔]|⚕|⚖|⚗|⚙|⚛|⚜|⚠|⚡|⚪|⚫|⚰|⚱|⚽|⚾|⛄|⛅|⛈|⛎|⛏|⛑|⛓|⛔|⛩|⛪|[⛰-⛵]|[⛷-⛺]|⛽|✂|✅|[✈-✍]|✏|✒|✔|✖|✝|✡|✨|✳|✴|❄|❇|❌|❎|[❓-❕]|❗|❣|❤|[➕-➗]|➡|➰|➿|⤴|⤵|[⬅-⬇]|⬛|⬜|⭐|⭕|〰|〽|㊗|㊙|\u{1F004}|\u{1F0CF}|\u{1F170}|\u{1F171}|\u{1F17E}|\u{1F17F}|\u{1F18E}|[\u{1F191}-\u{1F19A}]|[\u{1F1E6}-\u{1F1FF}]|\u{1F201}|\u{1F202}|\u{1F21A}|\u{1F22F}|[\u{1F232}-\u{1F23A}]|\u{1F250}|\u{1F251}|[\u{1F300}-\u{1F321}]|[\u{1F324}-\u{1F393}]|\u{1F396}|\u{1F397}|[\u{1F399}-\u{1F39B}]|[\u{1F39E}-\u{1F3F0}]|[\u{1F3F3}-\u{1F3F5}]|[\u{1F3F7}-\u{1F4FD}]|[\u{1F4FF}-\u{1F53D}]|[\u{1F549}-\u{1F54E}]|[\u{1F550}-\u{1F567}]|\u{1F56F}|\u{1F570}|[\u{1F573}-\u{1F579}]|\u{1F57A}|\u{1F587}|[\u{1F58A}-\u{1F58D}]|\u{1F590}|\u{1F595}|\u{1F596}|\u{1F5A4}|\u{1F5A5}|\u{1F5A8}|\u{1F5B1}|\u{1F5B2}|\u{1F5BC}|[\u{1F5C2}-\u{1F5C4}]|[\u{1F5D1}-\u{1F5D3}]|[\u{1F5DC}-\u{1F5DE}]|\u{1F5E1}|\u{1F5E3}|\u{1F5E8}|\u{1F5EF}|\u{1F5F3}|[\u{1F5FA}-\u{1F64F}]|[\u{1F680}-\u{1F6C5}]|[\u{1F6CB}-\u{1F6D0}]|\u{1F6D1}|\u{1F6D2}|\u{1F6D5}|[\u{1F6E0}-\u{1F6E5}]|\u{1F6E9}|\u{1F6EB}|\u{1F6EC}|\u{1F6F0}|\u{1F6F3}|[\u{1F6F4}-\u{1F6F6}]|\u{1F6F7}|\u{1F6F8}|\u{1F6F9}|\u{1F6FA}|[\u{1F7E0}-\u{1F7EB}]|[\u{1F90D}-\u{1F90F}]|[\u{1F910}-\u{1F918}]|[\u{1F919}-\u{1F91E}]|\u{1F91F}|[\u{1F920}-\u{1F927}]|[\u{1F928}-\u{1F92F}]|\u{1F930}|\u{1F931}|\u{1F932}|[\u{1F933}-\u{1F93A}]|[\u{1F93C}-\u{1F93E}]|\u{1F93F}|[\u{1F940}-\u{1F945}]|[\u{1F947}-\u{1F94B}]|\u{1F94C}|[\u{1F94D}-\u{1F94F}]|[\u{1F950}-\u{1F95E}]|[\u{1F95F}-\u{1F96B}]|[\u{1F96C}-\u{1F970}]|\u{1F971}|[\u{1F973}-\u{1F976}]|\u{1F97A}|\u{1F97B}|[\u{1F97C}-\u{1F97F}]|[\u{1F980}-\u{1F984}]|[\u{1F985}-\u{1F991}]|[\u{1F992}-\u{1F997}]|[\u{1F998}-\u{1F9A2}]|[\u{1F9A5}-\u{1F9AA}]|\u{1F9AE}|\u{1F9AF}|[\u{1F9B0}-\u{1F9B9}]|[\u{1F9BA}-\u{1F9BF}]|\u{1F9C0}|\u{1F9C1}|\u{1F9C2}|[\u{1F9C3}-\u{1F9CA}]|[\u{1F9CD}-\u{1F9CF}]|[\u{1F9D0}-\u{1F9E6}]|[\u{1F9E7}-\u{1F9FF}]|[\u{1FA70}-\u{1FA73}]|[\u{1FA78}-\u{1FA7A}]|[\u{1FA80}-\u{1FA82}]|[\u{1FA90}-\u{1FA95}]|⌚|⌛|[⏩-⏬]|⏰|⏳|◽|◾|☔|☕|[♈-♓]|♿|⚓|⚡|⚪|⚫|⚽|⚾|⛄|⛅|⛎|⛔|⛪|⛲|⛳|⛵|⛺|⛽|✅|✊|✋|✨|❌|❎|[❓-❕]|❗|[➕-➗]|➰|➿|⬛|⬜|⭐|⭕|\u{1F004}|\u{1F0CF}|\u{1F18E}|[\u{1F191}-\u{1F19A}]|[\u{1F1E6}-\u{1F1FF}]|\u{1F201}|\u{1F21A}|\u{1F22F}|[\u{1F232}-\u{1F236}]|[\u{1F238}-\u{1F23A}]|\u{1F250}|\u{1F251}|[\u{1F300}-\u{1F320}]|[\u{1F32D}-\u{1F335}]|[\u{1F337}-\u{1F37C}]|[\u{1F37E}-\u{1F393}]|[\u{1F3A0}-\u{1F3CA}]|[\u{1F3CF}-\u{1F3D3}]|[\u{1F3E0}-\u{1F3F0}]|\u{1F3F4}|[\u{1F3F8}-\u{1F43E}]|\u{1F440}|[\u{1F442}-\u{1F4FC}]|[\u{1F4FF}-\u{1F53D}]|[\u{1F54B}-\u{1F54E}]|[\u{1F550}-\u{1F567}]|\u{1F57A}|\u{1F595}|\u{1F596}|\u{1F5A4}|[\u{1F5FB}-\u{1F64F}]|[\u{1F680}-\u{1F6C5}]|\u{1F6CC}|\u{1F6D0}|\u{1F6D1}|\u{1F6D2}|\u{1F6D5}|\u{1F6EB}|\u{1F6EC}|[\u{1F6F4}-\u{1F6F6}]|\u{1F6F7}|\u{1F6F8}|\u{1F6F9}|\u{1F6FA}|[\u{1F7E0}-\u{1F7EB}]|[\u{1F90D}-\u{1F90F}]|[\u{1F910}-\u{1F918}]|[\u{1F919}-\u{1F91E}]|\u{1F91F}|[\u{1F920}-\u{1F927}]|[\u{1F928}-\u{1F92F}]|\u{1F930}|\u{1F931}|\u{1F932}|[\u{1F933}-\u{1F93A}]|[\u{1F93C}-\u{1F93E}]|\u{1F93F}|[\u{1F940}-\u{1F945}]|[\u{1F947}-\u{1F94B}]|\u{1F94C}|[\u{1F94D}-\u{1F94F}]|[\u{1F950}-\u{1F95E}]|[\u{1F95F}-\u{1F96B}]|[\u{1F96C}-\u{1F970}]|\u{1F971}|[\u{1F973}-\u{1F976}]|\u{1F97A}|\u{1F97B}|[\u{1F97C}-\u{1F97F}]|[\u{1F980}-\u{1F984}]|[\u{1F985}-\u{1F991}]|[\u{1F992}-\u{1F997}]|[\u{1F998}-\u{1F9A2}]|[\u{1F9A5}-\u{1F9AA}]|\u{1F9AE}|\u{1F9AF}|[\u{1F9B0}-\u{1F9B9}]|[\u{1F9BA}-\u{1F9BF}]|\u{1F9C0}|\u{1F9C1}|\u{1F9C2}|[\u{1F9C3}-\u{1F9CA}]|[\u{1F9CD}-\u{1F9CF}]|[\u{1F9D0}-\u{1F9E6}]|[\u{1F9E7}-\u{1F9FF}]|[\u{1FA70}-\u{1FA73}]|[\u{1FA78}-\u{1FA7A}]|[\u{1FA80}-\u{1FA82}]|[\u{1FA90}-\u{1FA95}]|[\u{1F3FB}-\u{1F3FF}]|☝|⛹|[✊-✍]|\u{1F385}|[\u{1F3C2}-\u{1F3C4}]|\u{1F3C7}|[\u{1F3CA}-\u{1F3CC}]|\u{1F442}|\u{1F443}|[\u{1F446}-\u{1F450}]|[\u{1F466}-\u{1F478}]|\u{1F47C}|[\u{1F481}-\u{1F483}]|[\u{1F485}-\u{1F487}]|\u{1F48F}|\u{1F491}|\u{1F4AA}|\u{1F574}|\u{1F575}|\u{1F57A}|\u{1F590}|\u{1F595}|\u{1F596}|[\u{1F645}-\u{1F647}]|[\u{1F64B}-\u{1F64F}]|\u{1F6A3}|[\u{1F6B4}-\u{1F6B6}]|\u{1F6C0}|\u{1F6CC}|\u{1F90F}|\u{1F918}|[\u{1F919}-\u{1F91E}]|\u{1F91F}|\u{1F926}|\u{1F930}|\u{1F931}|\u{1F932}|[\u{1F933}-\u{1F939}]|[\u{1F93C}-\u{1F93E}]|\u{1F9B5}|\u{1F9B6}|\u{1F9B8}|\u{1F9B9}|\u{1F9BB}|[\u{1F9CD}-\u{1F9CF}]|[\u{1F9D1}-\u{1F9DD}]|‍|⃣|\uFE0F|[\u{1F1E6}-\u{1F1FF}]|[\u{1F3FB}-\u{1F3FF}]|[\u{1F9B0}-\u{1F9B3}]|[\u{E0020}-\u{E007F}]|©|®|‼|⁉|™|ℹ|[↔-↙]|↩|↪|⌚|⌛|⌨|⎈|⏏|[⏩-⏳]|[⏸-⏺]|Ⓜ|▪|▫|▶|◀|[◻-◾]|[☀-☄]|★|[☇-☍]|☎|☏|☐|☑|☒|☔|☕|☖|☗|☘|[☙-☜]|☝|☞|☟|☠|☡|☢|☣|☤|☥|☦|[☧-☩]|☪|[☫-☭]|☮|☯|[☰-☷]|[☸-☺]|[☻-☿]|♀|♁|♂|[♃-♇]|[♈-♓]|[♔-♞]|♟|♠|♡|♢|♣|♤|♥|♦|♧|♨|[♩-♺]|♻|♼|♽|♾|♿|[⚀-⚅]|⚐|⚑|[⚒-⚔]|⚕|⚖|⚗|⚘|⚙|⚚|⚛|⚜|[⚝-⚟]|⚠|⚡|[⚢-⚩]|⚪|⚫|[⚬-⚯]|⚰|⚱|[⚲-⚼]|⚽|⚾|[⚿-⛃]|⛄|⛅|⛆|⛇|⛈|[⛉-⛍]|⛎|⛏|⛐|⛑|⛒|⛓|⛔|[⛕-⛨]|⛩|⛪|[⛫-⛯]|[⛰-⛵]|⛶|[⛷-⛺]|⛻|⛼|⛽|[⛾-✁]|✂|✃|✄|✅|[✈-✍]|✎|✏|✐|✑|✒|✔|✖|✝|✡|✨|✳|✴|❄|❇|❌|❎|[❓-❕]|❗|❣|❤|[❥-❧]|[➕-➗]|➡|➰|➿|⤴|⤵|[⬅-⬇]|⬛|⬜|⭐|⭕|〰|〽|㊗|㊙|[\u{1F000}-\u{1F003}]|\u{1F004}|[\u{1F005}-\u{1F0CE}]|\u{1F0CF}|[\u{1F0D0}-\u{1F0FF}]|[\u{1F10D}-\u{1F10F}]|\u{1F12F}|[\u{1F16C}-\u{1F16F}]|\u{1F170}|\u{1F171}|\u{1F17E}|\u{1F17F}|\u{1F18E}|[\u{1F191}-\u{1F19A}]|[\u{1F1AD}-\u{1F1E5}]|\u{1F201}|\u{1F202}|[\u{1F203}-\u{1F20F}]|\u{1F21A}|\u{1F22F}|[\u{1F232}-\u{1F23A}]|[\u{1F23C}-\u{1F23F}]|[\u{1F249}-\u{1F24F}]|\u{1F250}|\u{1F251}|[\u{1F252}-\u{1F2FF}]|[\u{1F300}-\u{1F321}]|\u{1F322}|\u{1F323}|[\u{1F324}-\u{1F393}]|\u{1F394}|\u{1F395}|\u{1F396}|\u{1F397}|\u{1F398}|[\u{1F399}-\u{1F39B}]|\u{1F39C}|\u{1F39D}|[\u{1F39E}-\u{1F3F0}]|\u{1F3F1}|\u{1F3F2}|[\u{1F3F3}-\u{1F3F5}]|\u{1F3F6}|[\u{1F3F7}-\u{1F3FA}]|[\u{1F400}-\u{1F4FD}]|\u{1F4FE}|[\u{1F4FF}-\u{1F53D}]|[\u{1F546}-\u{1F548}]|[\u{1F549}-\u{1F54E}]|\u{1F54F}|[\u{1F550}-\u{1F567}]|[\u{1F568}-\u{1F56E}]|\u{1F56F}|\u{1F570}|\u{1F571}|\u{1F572}|[\u{1F573}-\u{1F579}]|\u{1F57A}|[\u{1F57B}-\u{1F586}]|\u{1F587}|\u{1F588}|\u{1F589}|[\u{1F58A}-\u{1F58D}]|\u{1F58E}|\u{1F58F}|\u{1F590}|[\u{1F591}-\u{1F594}]|\u{1F595}|\u{1F596}|[\u{1F597}-\u{1F5A3}]|\u{1F5A4}|\u{1F5A5}|\u{1F5A6}|\u{1F5A7}|\u{1F5A8}|[\u{1F5A9}-\u{1F5B0}]|\u{1F5B1}|\u{1F5B2}|[\u{1F5B3}-\u{1F5BB}]|\u{1F5BC}|[\u{1F5BD}-\u{1F5C1}]|[\u{1F5C2}-\u{1F5C4}]|[\u{1F5C5}-\u{1F5D0}]|[\u{1F5D1}-\u{1F5D3}]|[\u{1F5D4}-\u{1F5DB}]|[\u{1F5DC}-\u{1F5DE}]|\u{1F5DF}|\u{1F5E0}|\u{1F5E1}|\u{1F5E2}|\u{1F5E3}|[\u{1F5E4}-\u{1F5E7}]|\u{1F5E8}|[\u{1F5E9}-\u{1F5EE}]|\u{1F5EF}|[\u{1F5F0}-\u{1F5F2}]|\u{1F5F3}|[\u{1F5F4}-\u{1F5F9}]|[\u{1F5FA}-\u{1F64F}]|[\u{1F680}-\u{1F6C5}]|[\u{1F6C6}-\u{1F6CA}]|[\u{1F6CB}-\u{1F6D0}]|\u{1F6D1}|\u{1F6D2}|\u{1F6D3}|\u{1F6D4}|\u{1F6D5}|[\u{1F6D6}-\u{1F6DF}]|[\u{1F6E0}-\u{1F6E5}]|[\u{1F6E6}-\u{1F6E8}]|\u{1F6E9}|\u{1F6EA}|\u{1F6EB}|\u{1F6EC}|[\u{1F6ED}-\u{1F6EF}]|\u{1F6F0}|\u{1F6F1}|\u{1F6F2}|\u{1F6F3}|[\u{1F6F4}-\u{1F6F6}]|\u{1F6F7}|\u{1F6F8}|\u{1F6F9}|\u{1F6FA}|[\u{1F6FB}-\u{1F6FF}]|[\u{1F774}-\u{1F77F}]|[\u{1F7D5}-\u{1F7DF}]|[\u{1F7E0}-\u{1F7EB}]|[\u{1F7EC}-\u{1F7FF}]|[\u{1F80C}-\u{1F80F}]|[\u{1F848}-\u{1F84F}]|[\u{1F85A}-\u{1F85F}]|[\u{1F888}-\u{1F88F}]|[\u{1F8AE}-\u{1F8FF}]|\u{1F90C}|[\u{1F90D}-\u{1F90F}]|[\u{1F910}-\u{1F918}]|[\u{1F919}-\u{1F91E}]|\u{1F91F}|[\u{1F920}-\u{1F927}]|[\u{1F928}-\u{1F92F}]|\u{1F930}|\u{1F931}|\u{1F932}|[\u{1F933}-\u{1F93A}]|[\u{1F93C}-\u{1F93E}]|\u{1F93F}|[\u{1F940}-\u{1F945}]|[\u{1F947}-\u{1F94B}]|\u{1F94C}|[\u{1F94D}-\u{1F94F}]|[\u{1F950}-\u{1F95E}]|[\u{1F95F}-\u{1F96B}]|[\u{1F96C}-\u{1F970}]|\u{1F971}|\u{1F972}|[\u{1F973}-\u{1F976}]|[\u{1F977}-\u{1F979}]|\u{1F97A}|\u{1F97B}|[\u{1F97C}-\u{1F97F}]|[\u{1F980}-\u{1F984}]|[\u{1F985}-\u{1F991}]|[\u{1F992}-\u{1F997}]|[\u{1F998}-\u{1F9A2}]|\u{1F9A3}|\u{1F9A4}|[\u{1F9A5}-\u{1F9AA}]|[\u{1F9AB}-\u{1F9AD}]|\u{1F9AE}|\u{1F9AF}|[\u{1F9B0}-\u{1F9B9}]|[\u{1F9BA}-\u{1F9BF}]|\u{1F9C0}|\u{1F9C1}|\u{1F9C2}|[\u{1F9C3}-\u{1F9CA}]|\u{1F9CB}|\u{1F9CC}|[\u{1F9CD}-\u{1F9CF}]|[\u{1F9D0}-\u{1F9E6}]|[\u{1F9E7}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FA73}]|[\u{1FA74}-\u{1FA77}]|[\u{1FA78}-\u{1FA7A}]|[\u{1FA7B}-\u{1FA7F}]|[\u{1FA80}-\u{1FA82}]|[\u{1FA83}-\u{1FA8F}]|[\u{1FA90}-\u{1FA95}]|[\u{1FA96}-\u{1FFFD}]/gu;
export const VALID_JVC_CHARACTERS = [" ", "!", "\"", "\n", "\r", "#", "$", "%", "&", "'", "‘", "’", "(", ")", "*", "+", ",", "-", ".", "/", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ":", ";", "<", "=", ">", "?", "@", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "[", "\\\\", "]", "^", "_", "`", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "{", "|", "}", "~", " ", "£", "¥", "§", "©", "«", "®", "°", "±", "²", "³", "´", "µ", "¶", "·", "»", "À", "Á", "Â", "Ã", "Ä", "Å", "Æ", "Ç", "È", "É", "Ê", "Ë", "Ì", "Í", "Î", "Ï", "Ð", "Ñ", "Ò", "Ó", "Ô", "Õ", "Ö", "×", "Ø", "Ù", "Ú", "Û", "Ü", "Ý", "Þ", "ß", "à", "á", "â", "ã", "ä", "å", "æ", "ç", "è", "é", "ê", "ë", "ì", "í", "î", "ï", "ð", "ñ", "ò", "ó", "ô", "õ", "ö", "÷", "ø", "ù", "ú", "û", "ü", "ý", "þ", "ÿ", "Œ", "œ", "‍", "‘", "’", "‚", "‛", "“", "”", "„", "‟", "•", "‣", "…", "‧", "‼", "⁉", "™", "ℹ"];
export const FORUMS_APP_REGEX = /window\.jvc\.forumsAppPayload="(.*?)"/;

export const URL_PLACEHOLDER = "item";

export const POST_MODERATION_URL = `https://${DOMAIN}/forums/modal_del_message.php`;
export const TOPIC_MODERATION_URL = `https://${DOMAIN}/forums/modal_moderation_topic.php`;
export const FORUMS_PAGE = `https://${DOMAIN}/forums.htm`;
export const JVCODE_URL = `https://${DOMAIN}/jvcode/forums.php?stickers=on`;
export const CREATE_TOPIC_URL = `https://${API_DOMAIN}/forums/create_topic.php?id_forum=`;
export const RESOLVE_TOPIC_URL = `https://${DOMAIN}/forums/ajax_topic_resolu.php`;

export const DEFAULT_PAGE = 1;
export const DEFAULT_PER_PAGE = 20;
export const MAXIMUM_PER_PAGE = 100_000;
export const TOPICS_PER_PAGE = 25;
export const TOPICS_PER_SEARCH_PAGE = 20;
export const POSTS_PER_PAGE = 20;

export const INTEGER_LIMIT = 2**31;

export const MOSAIC_VALUES = {
    tileWidth: 272,
    tileHeight: 204,
    maxCols: 8,
    maxRows: 10
};

export const TOPIC_ICONS: Record<string, string> = {
    "topic-folder1":"yellow",
    "topic-folder2":"red",
    "topic-pin-off":"pinned",
    "topic-resolved":"resolved"
}

export const SELECTORS = {
    "alert": "div.alert-danger",
    "warning": "div.alert-warning",
    "accountReport": "span.icon-report-problem",
    "topicItem": ".a-topic",
    "hashModeration": "#ajax_hash_moderation_forum",
    "hashMessage": "#ajax_hash_liste_messages",
    "jvCare": ".JvCare",
    "cdvPost": ".bloc-message-forum",
    "cdvNextPage": ".icon-next4",
    "forumsApp": "script:contains('window.jvc.forumsAppPayload')",
    "editProfile": ".option-profil-icon"
};

export const TOPIC_FEED_SELECTORS = {
    "icon": ".topic-icon",
    "title": ".titre-topic",
    "nbAnswers": ".nb-comm-topic",
    "author": ".auteur",
    "lastAnswerDate": ".date-post-topic",
    "connected": ".nb-connect-fofo",
    "forumTitle": ".etage-2",
    "nav": ".nav-next"
}

export const TOPIC_SELECTORS3 = {
    "title": ".bloc-nom-sujet span",
    "author": ".text-auteur",
    "publicationDate": ".date-post",
    "nbPages": ".num-i",
    "post": ".bloc-pseudo-msg",
    "connected": ".nb-connect-fofo"
}

export const TOPIC_SELECTORS = {
    "title": "#bloc-title-forum",
    "author": ".bloc-pseudo-msg",
    "publicationDate": ".bloc-date-msg span",
    "publicationDateApi": ".date-post",
    "nbPages": ".pagi-fin-actif",
    "post": ".bloc-pseudo-msg",
    "connected": ".nb-connect-fofo",
    "lockReason": ".message-lock-topic span",
    "resolved": ".titre-bloc-forum span"
}

export const TOPIC_POST_SELECTORS = {
    "class": ".post",
    "author": ".text-auteur",
    "date": ".date-post",
    "content": ".message"
}

export const POST_SELECTORS = {
    "author": ".text-user",
    "date": ".bloc-date-msg",
    "content": ".txt-msg",
    "topic": ".bloc-return-topic a"
};

export const POLL_SELECTORS = {
    "bloc": ".bloc-sondage",
    "title": ".sondage-titre",
    "answers": ".sondage-reponses li",
    "answersResult": "span"
};

export const FRENCH_MONTHS_TO_NUMBER = {
    "janvier": 0,
    "février": 1,
    "mars": 2,
    "avril": 3,
    "mai": 4,
    "juin": 5,
    "juillet": 6,
    "août": 7,
    "septembre": 8,
    "octobre": 9,
    "novembre": 10,
    "décembre": 11
};

export const HTTP_CODES = {
    CONTINUE: 100,
    SWITCHING_PROTOCOLS: 101,
    PROCESSING: 102,
    EARLY_HINTS: 103,

    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NON_AUTHORITATIVE_INFORMATION: 203,
    NO_CONTENT: 204,
    RESET_CONTENT: 205,
    PARTIAL_CONTENT: 206,
    MULTI_STATUS: 207,
    ALREADY_REPORTED: 208,
    IM_USED: 226,

    MULTIPLE_CHOICES: 300,
    MOVED_PERMANENTLY: 301,
    FOUND: 302,
    SEE_OTHER: 303,
    NOT_MODIFIED: 304,
    USE_PROXY: 305,
    TEMPORARY_REDIRECT: 307,
    PERMANENT_REDIRECT: 308,

    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    PAYMENT_REQUIRED: 402,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    NOT_ACCEPTABLE: 406,
    PROXY_AUTHENTICATION_REQUIRED: 407,
    REQUEST_TIMEOUT: 408,
    CONFLICT: 409,
    GONE: 410,
    LENGTH_REQUIRED: 411,
    PRECONDITION_FAILED: 412,
    PAYLOAD_TOO_LARGE: 413,
    URI_TOO_LONG: 414,
    UNSUPPORTED_MEDIA_TYPE: 415,
    RANGE_NOT_SATISFIABLE: 416,
    EXPECTATION_FAILED: 417,
    IM_A_TEAPOT: 418,
    MISDIRECTED_REQUEST: 421,
    UNPROCESSABLE_ENTITY: 422,
    LOCKED: 423,
    FAILED_DEPENDENCY: 424,
    TOO_EARLY: 425,
    UPGRADE_REQUIRED: 426,
    PRECONDITION_REQUIRED: 428,
    TOO_MANY_REQUESTS: 429,
    REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
    UNAVAILABLE_FOR_LEGAL_REASONS: 451,

    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
    HTTP_VERSION_NOT_SUPPORTED: 505,
    VARIANT_ALSO_NEGOTIATES: 506,
    INSUFFICIENT_STORAGE: 507,
    LOOP_DETECTED: 508,
    NOT_EXTENDED: 510,
    NETWORK_AUTHENTICATION_REQUIRED: 511
  };
  