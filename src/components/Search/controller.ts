import { debounce } from 'lodash';
import { reaction } from 'mobx';
import { IAwaitable } from 'await';
import { action, field, objects, observable } from 'state';
import { reportOnError } from 'error';
import { ITransport, isTransportError } from 'transport';
import { Author } from 'models';

export default class SearchController implements IAwaitable {

  @observable(field)() query: string = "";
  @observable(objects(field))() private authors: ReadonlyArray<Author>;
  @observable(field)() loading: boolean = false;

  private disposeLoader;
  getAuthors() {
    this.disposeLoader = this.disposeLoader ||
      reaction(
        () => this.query,
        // TODO(tim): This should only automatically reload results if query
        // change directly follows from an `onChange` on the input field, or
        // else we are breaking time travel.
        debounce(query => this.load(query), 300)
      );

    // TODO(tim): Do not substitute `undefined` for empty array to remain
    // explicit about difference between no data and empty list?
    return this.authors || [];
  }

  private readonly transport: ITransport<Author> & IAwaitable = new Author.Transport;

  async load(query) {
    this.startLoad();

    let instances: ReadonlyArray<Author> = [];

    query = query.trim();
    if (query) {
      const page = this.transport.list({ query });
      try {
        instances = await page;
      } catch (err) {
        if (isTransportError(err))
          return;
        throw err;
      }
    }

    this.endLoad(instances);
  }

  @action
  startLoad() {
    this.loading = true;
  }

  @action
  endLoad(authors) {
    this.authors = authors;
    this.loading = false;
  }

  get await() {
    return this.transport.await;
  }

}
