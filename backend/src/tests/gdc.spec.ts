import { assert } from 'chai';
import getSimilarlySizedMunicipalities from './../database/getSimilarlySizedMunicipalities';

describe('Similar municipalities', () => {
	
    const similarToTrondheim = await getSimilarlySizedMunicipalities("no.5001", 0.25);	
	/*
		name, code, population
		1. "Tampere", "fi.837", 209535
		2. "Turku", "fi.853", 175645
		3. "Nijmegen", "nl.0268", 177321
		4. "Eindhoven", "nl.0772", 235707
		5. "Uppsala", "se.0380", 177074
    */
	const expectedSimilarToTrondheim = new Set([ "fi.837", "fi.853", "nl.0268", "nl.0772", "se.0380" ]);

    it('All similar municipalities are expected', () => {
    	for (municipality of similarToTrondheim)
    	{
    		assert(expected.has(municipality.code));
    	}
    });

    it('No unexpected municipalities', () => {
    	for (municipality of similarToTrondheim) 
    	{
    		expected.remove(municipality);
    	}

    	assert(expected.size == 0);
    });
});