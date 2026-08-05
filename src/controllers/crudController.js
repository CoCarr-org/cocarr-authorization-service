function makeCrudController(service) {
  return {
    list: async (req, res, next) => { try { res.json(await service.list(req.query)); } catch (e) { next(e); } },
    get: async (req, res, next) => { try { res.json(await service.getById(req.params.id)); } catch (e) { next(e); } },
    create: async (req, res, next) => { try { res.status(201).json(await service.create(req.body)); } catch (e) { next(e); } },
    update: async (req, res, next) => { try { res.json(await service.update(req.params.id, req.body)); } catch (e) { next(e); } },
    remove: async (req, res, next) => { try { res.json(await service.remove(req.params.id)); } catch (e) { next(e); } },
  };
}
module.exports = { makeCrudController };
