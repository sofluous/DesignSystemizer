const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function ready(evaluate) {
  for (let i=0; i<150; i++) {
    if (await evaluate('document.readyState === "complete" && !!window.DesignSystemStudioPageBootstrap')) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('Studio did not become ready');
}
async function screenshot({ send, session, root }, name) {
  fs.writeFileSync(path.join(root, '_docs/data/' + name + '.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' }, session)).data, 'base64'));
}
exports.testIcons = async (context) => {
  const { evaluate, send, session, url } = context;
  const proposal = await evaluate(`(async () => {
    const el = id => document.getElementById(id);
    const check = (value, message) => { if (!value) throw new Error(message); };
    const select = id => document.querySelector('[data-icon-token="' + id + '"]').click();
    DesignSystemStudioShell.activatePanel('icons');
    check(document.querySelectorAll('[data-icon-token]').length === 64, 'Library lists all records');
    select('search');
    check(el('iconProperties').contains(el('iconInspector')), 'Properties are on the right');
    check(el('iconInspectorStatus').textContent === 'Saved', 'Saved artwork is baseline');
    check(document.querySelector('[data-icon-id="search"]').getAttribute('aria-pressed') === 'true', 'List and card share selection');
    el('iconSearch').value = 'no-match'; el('iconSearch').dispatchEvent(new Event('input'));
    check(!document.querySelector('[data-icon-token]') && !el('iconSelectedHidden').hidden, 'Shared filter preserves selection');
    el('iconShowSelectedBtn').click(); el('iconInspectorBrowseBtn').click();
    check(!el('iconCandidateDialog').hidden && el('iconCandidateDialog').tagName !== 'DIALOG', 'Replacement is inline');
    check(el('iconCandidateTitle').textContent.includes('action.search'), 'Target stays visible');
    check(document.querySelectorAll('.icon-candidate-item').length > 3, 'Broader source catalog');
    document.querySelector('[data-candidate-id="lucide-search"]').click();
    check(el('iconInspectorPreview').querySelector('img'), 'Properties previews candidate');
    check(document.querySelector('[data-icon-id="search"] svg circle'), 'Preview is unassigned');
    el('closeIconCandidateBtn').click();
    check(el('iconInspectorPreview').querySelector('svg circle'), 'Back restores assigned art');
    el('iconInspectorBrowseBtn').click(); document.querySelector('[data-candidate-id="lucide-search"]').click(); el('iconCandidateApplyBtn').click();
    check(el('iconCandidateDialog').hidden && el('iconInspectorStatus').textContent === 'Draft', 'Assign creates draft');
    check(JSON.parse(localStorage.getItem('ds-icon-state')).selection.search.candidateId === 'lucide-search', 'Assignment persists');
    check(el('iconPrepareApprovalBtn').textContent === 'Export changes', 'Static mode names export honestly');
    window.iconDownloads = []; DesignSystemStudioPackaging.downloadBlob = (name, blob) => window.iconDownloads.push({ name, blob });
    el('iconPrepareApprovalBtn').click();
    check(!el('iconApprovalDialog').hidden && el('iconApprovalDialog').tagName !== 'DIALOG', 'Review stays inline');
    el('iconApprovalRevision').value = 'v1.2.3'; el('iconApprovalLicenseText').value = 'Test fixture notice';
    el('iconApprovalForm').requestSubmit();
    for(let i=0;i<150 && el('iconApprovalSubmit').disabled;i++) await new Promise(r=>setTimeout(r,20));
    check(!window.iconDownloads.length && el('iconApprovalPreview').querySelector('path[id="fixture"]'), 'Review exact pinned artwork');
    el('iconApprovalReviewed').checked = true; el('iconApprovalForm').requestSubmit();
    for(let i=0;i<150 && !window.iconDownloads.length;i++) await new Promise(r=>setTimeout(r,20));
    check(window.iconDownloads.length === 1, 'Export produces proposal');
    const proposal = JSON.parse(await window.iconDownloads.pop().blob.text());
    check(proposal.source.url.includes('/v1.2.3/') && !/script|onload|foreignObject/.test(proposal.svg), 'Pinned sanitized SVG');
    select('close'); select('search'); el('iconPrepareApprovalBtn').click();
    check(el('iconApprovalRevision').value === 'v1.2.3', 'Review metadata retained between selections');
    el('iconApprovalCancel').click(); check(el('iconInspectorStatus').textContent === 'Draft', 'Export does not mark saved');
    return proposal;
  })()`);
  require('./icon-library.cjs').validateProposal(proposal);
  await screenshot(context, 'icon-workspace-desktop');
  await evaluate(`document.getElementById('iconInspectorBrowseBtn').click()`);
  await screenshot(context, 'icon-workspace-replacement');
  await send('Emulation.setDeviceMetricsOverride', { width:390,height:844,deviceScaleFactor:1,mobile:false },session);
  await evaluate(`(async () => {
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const el=id=>document.getElementById(id);
    document.querySelector('[data-icon-view="library"]').click();
    if(!el('iconMobileLibrary').contains(el('iconSearch')) || el('iconMobileLibrary').hidden) throw new Error('Mobile navigation');
    document.querySelector('[data-icon-token="close"]').click();
    if(el('panel-icons').dataset.view!=='canvas') throw new Error('Library selection locates canvas');
    document.querySelector('[data-icon-id="close"]').click();
    if(el('panel-icons').dataset.view!=='properties') throw new Error('Card opens mobile Properties');
    el('iconInspectorBrowseBtn').click(); el('iconCandidateUploadBtn').click();
    if(el('iconApprovalDialog').hidden) throw new Error('Custom artwork editor');
    const transfer=new DataTransfer(); transfer.items.add(new File(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M1 2L3 4" stroke="currentColor"/></svg>'],'original.svg',{type:'image/svg+xml'}));
    el('iconApprovalFile').files=transfer.files;el('iconApprovalFile').dispatchEvent(new Event('change'));
    for(let i=0;i<100 && el('iconApprovalSubmit').disabled;i++) await new Promise(r=>setTimeout(r,20));
    if(!el('iconApprovalPreview').querySelector('path')) throw new Error('Custom preview');
    if(document.documentElement.scrollWidth>innerWidth+1) throw new Error('Mobile overflow');
  })()`);
  await screenshot(context,'icon-workspace-mobile');
  await evaluate(`localStorage.setItem('ds-icon-state',JSON.stringify({version:1,defaults:{search:{mode:'candidate',candidateId:'lucide-search'}},selection:{close:{mode:'candidate',candidateId:'iconoir-cancel'}}}))`);
  await send('Page.navigate',{url:url+'/index.html'},session);await ready(evaluate);
  await evaluate(`(() => {DesignSystemStudioShell.activatePanel('icons');document.querySelector('[data-icon-token="search"]').click();document.getElementById('iconRevertBtn').click();const state=JSON.parse(localStorage.getItem('ds-icon-state'));if(state.version!==2 || !state.selection.close || state.selection.search) throw new Error('Preserve migrated drafts');})()`);
  console.log('PASS three-panel selection, shared filters, inline replacement/review, assignment, export, SVG fidelity, metadata, mobile and legacy drafts');
};
exports.testConnected = async ({evaluate,send,session,url}) => {
  await evaluate(`(async () => {
    DesignSystemStudioShell.activatePanel('icons');const el=id=>document.getElementById(id);
    for(let i=0;i<100 && !DesignSystemStudioIconApproval.connected();i++) await new Promise(r=>setTimeout(r,20));
    if(!DesignSystemStudioIconApproval.connected()) throw new Error('Project connection');
    document.querySelector('[data-icon-token="search"]').click();el('iconInspectorBrowseBtn').click();document.querySelector('[data-candidate-id="lucide-search"]').click();el('iconCandidateApplyBtn').click();
    if(el('iconPrepareApprovalBtn').textContent!=='Save changes') throw new Error('Connected save action');
    el('iconPrepareApprovalBtn').click();el('iconApprovalRevision').value='v1.2.3';el('iconApprovalLicenseText').value='Test fixture license';el('iconApprovalForm').requestSubmit();
    for(let i=0;i<150 && el('iconApprovalSubmit').disabled;i++) await new Promise(r=>setTimeout(r,20));
    el('iconApprovalReviewed').checked=true;el('iconApprovalForm').requestSubmit();
    for(let i=0;i<150 && el('iconApprovalSubmit').disabled;i++) await new Promise(r=>setTimeout(r,20));
    if(el('iconInspectorStatus').textContent!=='Saved' || !el('iconInspectorPreview').querySelector('path[id="fixture"]')) throw new Error('Saved artwork/status: '+JSON.stringify({state:el('iconInspectorStatus').textContent,message:el('iconApprovalStatus').textContent,svg:el('iconInspectorPreview').innerHTML}));
    if(JSON.parse(localStorage.getItem('ds-icon-state')).selection.search) throw new Error('Clear saved draft');
    const files=DesignSystemStudioPackaging.buildThemePackageFiles({themeName:'test',themeBlock:'',recipe:{}});
    const manifest=JSON.parse(files.find(file=>file.name.endsWith('/icons/manifest.json')).content);
    if(manifest.version!==DesignSystemApprovedIcons.version || !files.some(file=>file.name.endsWith('.svg') && file.content.includes('id="fixture"'))) throw new Error('Same-session exports must include saved artwork');
  })()`);
  await send('Page.navigate',{url:url+'/index.html'},session);await ready(evaluate);
  await evaluate(`(() => {DesignSystemStudioShell.activatePanel('icons');document.querySelector('[data-icon-token="search"]').click();if(document.getElementById('iconInspectorStatus').textContent!=='Saved' || !document.getElementById('iconInspectorPreview').querySelector('path[id="fixture"]')) throw new Error('Disk-backed reload');})()`);
  console.log('PASS project-connected save, artwork refresh, draft clearing and disk-backed reload (isolated fixture)');
};
